import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
    certificateId: { type: String, required: true, unique: true },
    userId: { type: String, ref: 'User', required: true },
    courseId: { type: String, ref: 'Course', required: true },
    courseName: { type: String, required: true },
    studentName: { type: String, required: true },
    completionDate: { type: Date, required: true },
    certificateUrl: { type: String } // Cloudinary URL for certificate image
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
