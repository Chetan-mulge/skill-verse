import { generateLectureSummary } from '../utils/geminiAI.js';

// Generate lecture summary using AI
export const getLectureSummary = async (req, res) => {
    try {
        const { lectureTitle, lectureDuration } = req.body;

        if (!lectureTitle) {
            return res.json({ success: false, message: 'Lecture title is required' });
        }

        const summary = await generateLectureSummary(lectureTitle, lectureDuration || 0);

        res.json({ success: true, summary });
    } catch (error) {
        console.error('Error in getLectureSummary:', error);
        res.json({ success: false, message: error.message });
    }
};
