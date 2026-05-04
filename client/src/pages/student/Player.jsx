import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube'
import Footer from '../../components/student/Footer'
import Rating from '../../components/student/Rating'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../../components/student/Loading'

const Player = () => {

  const { enrolledCourses, calculateChapterTime, backendUrl, getToken, userData, fetchUserEnrolledCourses } = useContext(AppContext)

  const { courseId } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [playerData, setPlayerData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [initialRating, setInitialRating] = useState(0)
  const [certificate, setCertificate] = useState(null)
  const [courseCompleted, setCourseCompleted] = useState(false)
  const [lectureSummaries, setLectureSummaries] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState({});
  const [expandedSummaries, setExpandedSummaries] = useState({});

  const getCourseData = () => {
    enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course)
        course.courseRatings.map((item) => {
          if (item.userId === userData._id) {
            setInitialRating(item.rating)
          }
        })
      }
    })
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => (
      {
        ...prev,
        [index]: !prev[index],
      }
    ));
  };

  const fetchLectureSummary = async (lectureTitle, lectureDuration, lectureId) => {
    if (lectureSummaries[lectureId]) {
      setExpandedSummaries(prev => ({ ...prev, [lectureId]: !prev[lectureId] }));
      return;
    }

    try {
      setLoadingSummaries(prev => ({ ...prev, [lectureId]: true }));
      const token = await getToken();

      const { data } = await axios.post(backendUrl + '/api/ai/lecture-summary',
        { lectureTitle, lectureDuration },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setLectureSummaries(prev => ({ ...prev, [lectureId]: data.summary }));
        setExpandedSummaries(prev => ({ ...prev, [lectureId]: true }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [lectureId]: false }));
    }
  };

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData()
    }
  }, [enrolledCourses])

  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(backendUrl + '/api/user/update-course-progress', { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } })

      if (data.success) {
        toast.success(data.message)
        getCourseProgress()

        // Check if course completed and certificate generated
        if (data.courseCompleted && data.certificateId) {
          setCourseCompleted(true)
          toast.success(' Congratulations! You completed the course!')
          fetchCertificate()
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getCourseProgress = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.post(backendUrl + '/api/user/get-course-progress', { courseId },
        { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        setProgressData(data.progressData)

        // Check if course is completed and has certificate
        if (data.progressData && data.progressData.completed && data.progressData.certificateId) {
          setCourseCompleted(true)
          fetchCertificate()
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchCertificate = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get(backendUrl + `/api/user/certificate/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        setCertificate(data.certificate)
      }
    } catch (error) {
      console.error('Error fetching certificate:', error.message)
    }
  }

  const downloadCertificate = () => {
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
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMTI4IDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTguNzc3NyAxMC4wNzQxQzE4Ljc3NzcgMTUuNjU5MyAxMy44ODE1IDE4LjQ4MTUgOS4zODg4OSAxOC40ODE1QzQuODk2MyAxOC40ODE1IDAgMTUuNjU5MyAwIDEwLjA3NDFDMCAxMC4wNzQxIDAgOC44MzMzMyAwIDguODMzMzNDMCA4LjgzMzMzIDQuODk2MyA4LjgzMzMzIDkuMzg4ODkgOC44MzMzM0MxMy44ODE1IDguODMzMzMgMTguNzc3NyA4LjgzMzMzIDE4Ljc3NzcgOC44MzMzM0MxOC43Nzc3IDguODMzMzMgMTguNzc3NyAxMC4wNzQxIDE4Ljc3NzcgMTAuMDc0MVoiIGZpbGw9IiMwMDY2Y2MiLz4KPHBhdGggZD0iTTkuMzg4ODkgMEM0Ljg5NjMgMCAwIDE1LjY1OTMgMCAxNS42NTkzQzAgMTUuNjU5MyA0Ljg5NjMgMzIgOS4zODg4OSAzMkMxMy44ODE1IDMyIDE4Ljc3NzcgMTUuNjU5MyAxOC43Nzc3IDE1LjY1OTNDMTguNzc3NyAxNS42NTkzIDEzLjg4MTUgMCA5LjM4ODg5IDBaIiBmaWxsPSIjMDA2NmNjIi8+CjxwYXRoIGQ9Ik0yNy44NDI2IDguODMzMzNWMjMuMTY2N0gyNS44MzMzVjguODMzMzNIMjcuODQyNlpNMzQuNjU5MyA4LjgzMzMzVjIzLjE2NjdIMzIuNjVWOC44MzMzM0gzNC42NTkzWiIgZmlsbD0iIzAwNjZjYyIvPgo8cGF0aCBkPSJNNDEuNDc2IDguODMzMzNWMjMuMTY2N0gzOS40NjY3VjguODMzMzNINDEuNDc2Wk00OC4yOTI2IDguODMzMzNWMjMuMTY2N0g0Ni4yODMzVjguODMzMzNINDguMjkyNloiIGZpbGw9IiMwMDY2Y2MiLz4KPHBhdGggZD0iTTU5LjQyMiA4LjgzMzMzSDYxLjQzMTVINjUuNDVWMjMuMTY2N0g2My40NDA3VjEwLjg0MjZINjEuNDMxNUg1OS40MjJWOC44MzMzM1oiIGZpbGw9IiMwMDY2Y2MiLz4KPHBhdGggZD0iTTczLjU5MiA4LjgzMzMzSDc1LjYwMTVINzkuNjJWMjMuMTY2N0g3Ny42MTA3VjEwLjg0MjZINzUuNjAxNUg3My41OTJWOC44MzMzM1oiIGZpbGw9IiMwMDY2Y2MiLz4KPHBhdGggZD0iTTg3Ljc2MiA4LjgzMzMzSDg5Ljc3MTU5My43OVYyMy4xNjY3SDkxLjc4MDdWMTAuODQyNkg4OS43NzE1SDg3Ljc2MlY4LjgzMzMzWiIgZmlsbD0iIzAwNjZjYyIvPgo8cGF0aCBkPSJNMTAxLjkzMiA4LjgzMzMzSDEwMy45NDFIMTA3Ljk2VjIzLjE2NjdIMTA1Ljk1MVYxMC44NDI2SDEwMy45NDFIMTAxLjkzMlY4LjgzMzMzWiIgZmlsbD0iIzAwNjZjYyIvPgo8cGF0aCBkPSJNMTE2LjEwMiA4LjgzMzMzSDExOC4xMTJIMTIyLjEzVjIzLjE2NjdIMTIwLjEyMVYxMC44NDI2SDExOC4xMTJIMTE2LjEwMlY4LjgzMzMzWiIgZmlsbD0iIzAwNjZjYyIvPgo8L3N2Zz4K" alt="Logo">
            </div>
            <div class="certificate-meta">
              Certificate ID: ${certificate.certificateId}<br>
              Reference Number: SP-${certificate.certificateId.substring(0, 8).toUpperCase()}
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

  const handleRate = async (rating) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(backendUrl + '/api/user/add-rating', { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } })

      if (data.success) {
        toast.success(data.message)
        fetchUserEnrolledCourses()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    getCourseProgress()
  }, [])

  return courseData ? (
    <>
      <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36 '>

        {/* left column */}
        <div className='text-gray-800'>
          <h2 className='text-xl font-semibold'>Course Structure</h2>

          <div className='pt-5'>
            {courseData && courseData.courseContent.map((chapter, index) => (
              <div key={index} className='border border-gray-300 bg-white mb-2 rounded'>
                <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none'
                  onClick={() => toggleSection(index)}>
                  <div className='flex items-center gap-2'>
                    <img className={`transform transition-transform ${openSections[index] ? 'rotate-180' : ''}`}
                      src={assets.down_arrow_icon} alt="arrow icon" />
                    <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                  </div>
                  <p className='text-sm md:text-default'>{chapter.chapterContent.length} lectures -
                    {calculateChapterTime(chapter)}</p>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' :
                  'max-h-0'}`}>
                  <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                    {chapter.chapterContent.map((lecture, i) => {
                      const lectureId = lecture.lectureId || `${index}-${i}`;
                      return (
                        <li key={i} className='py-1'>
                          <div className='flex items-start gap-2'>
                            <img src={progressData && progressData.lectureCompleted.includes(lecture.lectureId)
                              ? assets.blue_tick_icon : assets.play_icon} alt="play icon" className='w-4 h-4 mt-1 flex-shrink-0' />
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default gap-2'>
                                <p className='truncate flex-1'>{lecture.lectureTitle}</p>
                                <div className='flex gap-2 flex-shrink-0'>
                                  {lecture.lectureUrl && <p
                                    onClick={() => setPlayerData({
                                      ...lecture, chapter: index + 1, lecture: i + 1
                                    })}
                                    className='text-blue-500 cursor-pointer hover:underline'>Watch</p>}
                                  <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
                                </div>
                              </div>

                              {/* AI Summary Button */}
                              <div className='mt-2'>
                                <button
                                  onClick={() => fetchLectureSummary(lecture.lectureTitle, lecture.lectureDuration, lectureId)}
                                  disabled={loadingSummaries[lectureId]}
                                  className='flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                  <span>✨</span>
                                  {loadingSummaries[lectureId] ? 'Generating...' : expandedSummaries[lectureId] ? 'Hide AI Summary' : 'AI Summary'}
                                </button>

                                {expandedSummaries[lectureId] && lectureSummaries[lectureId] && (
                                  <div className='mt-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r text-xs md:text-sm text-gray-700 leading-relaxed'>
                                    <p className='font-semibold text-blue-700 mb-1'>📚 What you'll learn:</p>
                                    <p>{lectureSummaries[lectureId]}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

              </div>
            ))}
          </div>

          <div className='flex items-center gap-2 py-3 mt-10'>
            <h1 className='text-xl font-bold'>Rate this Course:</h1>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>

          {/* Certificate Download Section */}
          {courseCompleted && certificate && (
            <div className='bg-cyan-50 border-2 border-blue-500 rounded-lg p-6 mt-6 shadow-md'>
              <div className='flex items-center gap-3 mb-3'>
                <span className='text-4xl'></span>
                <h2 className='text-2xl font-bold text-blue-700'>Congratulations!</h2>
              </div>
              <p className='text-gray-700 mb-4 text-lg'>You have successfully completed this course!</p>
              <button
                onClick={downloadCertificate}
                className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors shadow-md'
              >
                <span className='text-xl'></span>
                Download Certificate
              </button>
            </div>
          )}

        </div>

        {/* right column */}
        <div className='md:mt-10'>
          {playerData ? (
            <div>
              <YouTube videoId={playerData.lectureUrl.split('/').pop()} iframeClassName='w-full aspect-video' />
              <div className='flex justify-between items-center mt-1'>
                <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
                <button onClick={() => markLectureAsCompleted(playerData.lectureId)}
                  className='text-blue-600'>{progressData && progressData.lectureCompleted.includes(playerData.lectureId)
                    ? 'Completed' : 'Mark Complete'}</button>
              </div>
            </div>
          )
            :
            <img src={courseData ? courseData.courseThumbnail : ''} alt="" />
          }
        </div>

      </div>
      <Footer />
    </>
  ) : <Loading />
}

export default Player
