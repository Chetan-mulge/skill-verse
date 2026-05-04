import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { Line } from 'rc-progress'
import Footer from '../../components/student/Footer'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyEnrollments = () => {

  const { enrolledCourses, calculateCourseDuration, navigate, userData, fetchUserEnrolledCourses, backendUrl, getToken,
    calculateNoOfLectures } = useContext(AppContext)

  const [progressArray, setProgressArray] = useState([])
  const [certificatesMap, setCertificatesMap] = useState({})

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course) => {
          const { data } = await axios.post(`${backendUrl}/api/user/get-course-progress`, { courseId: course._id }, { headers: { Authorization: `Bearer ${token}` } })
          let totalLectures = calculateNoOfLectures(course);
          const lectureCompleted = data.progressData ? data.progressData.lectureCompleted.length : 0;

          // Fetch certificate if course is completed
          if (data.progressData && data.progressData.completed && data.progressData.certificateId) {
            const certResponse = await axios.get(`${backendUrl}/api/user/certificate/${course._id}`,
              { headers: { Authorization: `Bearer ${token}` } })
            if (certResponse.data.success) {
              setCertificatesMap(prev => ({ ...prev, [course._id]: certResponse.data.certificate }))
            }
          }

          return { totalLectures, lectureCompleted, courseId: course._id }
        })
      )
      setProgressArray(tempProgressArray);

    } catch (error) {
      toast.error(error.message);
    }
  }

  const downloadCertificate = (certificate) => {
    if (!certificate) return

    // Create a professional certificate HTML similar to Udemy design
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f7f9fa;
            padding: 40px 20px;
            zoom: 0.8;
          }
          
          .certificate-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 60px 80px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 60px;
          }
          
          .logo img {
            height: 40px;
            width: auto;
          }
          
          .certificate-meta {
            text-align: right;
            font-size: 10px;
            color: #6a6f73;
            line-height: 1.6;
          }
          
          .title-section {
            margin-bottom: 40px;
          }
          
          .certificate-label {
            font-size: 14px;
            font-weight: 600;
            color: #6a6f73;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 20px;
          }
          
          .course-title {
            font-size: 48px;
            font-weight: 700;
            color: #1c1d1f;
            line-height: 1.2;
            margin-bottom: 10px;
          }
          
          .instructor-info {
            font-size: 14px;
            color: #6a6f73;
            margin-top: 20px;
          }
          
          .instructor-info strong {
            color: #1c1d1f;
            font-weight: 600;
          }
          
          .student-section {
            margin: 80px 0 60px 0;
          }
          
          .student-name {
            font-size: 56px;
            font-weight: 700;
            color: #1c1d1f;
            margin-bottom: 20px;
          }
          
          .completion-details {
            display: flex;
            gap: 40px;
            font-size: 14px;
            color: #6a6f73;
          }
          
          .completion-details strong {
            color: #1c1d1f;
            font-weight: 600;
          }
          
          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #e4e8eb;
            text-align: center;
            font-size: 12px;
            color: #6a6f73;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .certificate-container {
              box-shadow: none;
              padding: 40px 60px;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="header">
            <div class="logo">
            <img src="https://res.cloudinary.com/dotcssqa0/image/upload/v1770460578/logo5_wzqmcx.svg" alt="skillverse">
            </div>
            <div class="certificate-meta">
              Certificate ID: ${certificate.certificateId}<br>
              Reference Number: SV-${certificate.certificateId.substring(0, 8).toUpperCase()}
            </div>
          </div>
          
          <div class="title-section">
            <div class="certificate-label">Certificate of Completion</div>
            <h1 class="course-title">${certificate.courseName}</h1>
            <div class="instructor-info">
              <strong>Online Course</strong>
            </div>
          </div>
          
          <div class="student-section">
            <div class="student-name">${certificate.studentName}</div>
            <div class="completion-details">
              <div><strong>Date:</strong> ${new Date(certificate.completionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
          
          <div class="footer">
            This certificate confirms that the above-named individual has successfully completed the course.<br>
            Issued by Online Learning Platform
          </div>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([certificateHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Certificate-${certificate.courseName.replace(/\s+/g, '-')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses()
    }
  }, [userData])

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress()
    }
  }, [enrolledCourses])

  return (
    <>
      <div className='md:px-36 px-8 pt-10'>
        <h1 className='text-2xl font-semibold'>My Enrollments</h1>
        <table className='md:table-auto table-fixed w-full overflow-hidden border mt-10'>
          <thead className='text-gray-900 border border-gray-500/20 text-sm text-left max-sm:hidden'>
            <tr>
              <th className='px-4 py-3 font-semibold truncate'>Course</th>
              <th className='px-4 py-3 font-semibold truncate'>Duration</th>
              <th className='px-4 py-3 font-semibold truncate'>Completed</th>
              <th className='px-4 py-3 font-semibold truncate'>Status</th>
              <th className='px-4 py-3 font-semibold truncate'>Certificate</th>
            </tr>
          </thead>
          <tbody className='text-gray-700'>
            {enrolledCourses.map((course, index) => (
              <tr key={index} className='border border-gray-500/20'>
                <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3'>
                  <img src={course.courseThumbnail} alt="" className='w-14 sm:w-24 md:w-28' />
                  <div className='flex-1'>
                    <p className='mb-1 max-sm:text-sm'>{course.courseTitle}</p>
                    <Line strokeWidth={2} percent={progressArray[index] ? (progressArray[index].lectureCompleted * 100) /
                      progressArray[index].totalLectures : 0} className='bg-gray-300 rounded-full' />
                  </div>
                </td>
                <td className='px-4 py-3 max-sm:hidden'>
                  {calculateCourseDuration(course)}
                </td>
                <td className='px-4 py-3 max-sm:hidden'>
                  {progressArray[index] && `${progressArray[index].lectureCompleted} / 
                ${progressArray[index].totalLectures}`}
                  <span>Lectures</span>
                </td>
                <td className='px-4 py-3 max-sm:text-right'>
                  <button className='px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white'
                    onClick={() => navigate('/player/' + course._id)}>
                    {progressArray[index] && progressArray[index].lectureCompleted / progressArray[index]
                      .totalLectures === 1 ? 'Completed' : 'On Going'}
                  </button>
                </td>
                <td className='px-4 py-3 text-center max-sm:hidden'>
                  {certificatesMap[course._id] ? (
                    <button
                      onClick={() => downloadCertificate(certificatesMap[course._id])}
                      className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors'
                    >
                      Download
                    </button>
                  ) : (
                    <span className='text-gray-400 text-sm'>Not Available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Footer />
    </>
  )
}

export default MyEnrollments
