exports.chatWithHotel = async (req, res) => {
    try {
        const { message, hotelId, hotelName, conversationId } = req.body;
        const userId = req.user?.id || 'anonymous';

        const baseUrl = process.env.DIFY_API_URL.endsWith('/v1')
            ? process.env.DIFY_API_URL
            : `${process.env.DIFY_API_URL}/v1`;

        const response = await fetch(`${baseUrl}/chat-messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DIFY_API_KEY.trim()}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                inputs: { hotel_name: hotelName, hotel_id: hotelId },
                query: message,
                user: `user-${userId}`,
                // 1. 改为 streaming 模式，保持连接活跃
                response_mode: "streaming",
                conversation_id: conversationId || ""
            }),
            signal: AbortSignal.timeout(300000) // 5分钟超时
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        // 2. 处理流式数据块
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullAnswer = "";
        let finalConversationId = conversationId;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            // Dify 的流式返回格式是 event: message\ndata: {...}
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    try {
                        const data = JSON.parse(line.slice(5));
                        // 累加回答内容
                        if (data.event === 'message' || data.event === 'agent_message') {
                            fullAnswer += data.answer || "";
                        }
                        // 记录会话ID
                        if (data.conversation_id) {
                            finalConversationId = data.conversation_id;
                        }
                    } catch (e) {
                        // 忽略非 JSON 行（如 ping）
                    }
                }
            }
        }

        // 3. 当流结束，一次性返回给小程序
        return res.json({
            code: 200,
            data: fullAnswer || "酒店助手暂时没有响应，请稍后再试",
            conversation_id: finalConversationId
        });

    } catch (error) {
        console.error('Chat Error:', error.message);
        if (res.headersSent) return;
        return res.status(500).json({ message: '服务繁忙，请重试', error: error.message });
    }
};