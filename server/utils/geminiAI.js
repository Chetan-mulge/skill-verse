import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateLectureSummary = async (lectureTitle, lectureDuration) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Generate a professional and concise summary for an online course lecture with the following details:
    
Lecture Title: "${lectureTitle}"
Duration: ${lectureDuration} minutes

Please provide a 2-3 sentence summary that:
1. Describes what students will learn in this lecture
2. Highlights the key concepts or skills covered
3. Is engaging and informative

Keep the tone professional and educational. Focus on learning outcomes.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        return summary.trim();
    } catch (error) {
        console.error('Error generating lecture summary:', error);
        throw new Error('Failed to generate lecture summary');
    }
};
