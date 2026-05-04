import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext';
import Loading from '../../components/student/Loading';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import Footer from '../../components/student/Footer';
import YouTube from 'react-youtube';
import axios from 'axios'
import { toast } from 'react-toastify';

const CourseDetails = () => {

  const { id } = useParams()

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [lectureSummaries, setLectureSummaries] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState({});
  const [expandedSummaries, setExpandedSummaries] = useState({});

  const { allCourses, calculateRating, calculateNoOfLectures, calculateCourseDuration,
    calculateChapterTime, currency, backendUrl, userData, getToken } = useContext(AppContext)
  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/course/' + id)

      if (data.success) {
        setCourseData(data.courseData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const enrollCourse = async () => {
    try {
      if (!userData) {
        return toast.warn('Login to Enroll')
      }
      if (isAlreadyEnrolled) {
        return toast.warn('Already Enrolled')
      }
      const token = await getToken();

      const { data } = await axios.post(backendUrl + '/api/user/purchase', { courseId: courseData._id },
        { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        const { session_url } = data
        window.location.replace(session_url)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchCourseData();
  }, [])

  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id))
    }
  }, [userData, courseData])

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

  return courseData ? (
    <>
      <div className='flex md:flex-row flex-col-reverse gap-6 md:gap-10 relative items-start justify-between
    md:px-10 lg:px-20 px-4 md:pt-20 pt-16 pb-10 text-left max-w-[1400px] mx-auto'>

        <div className='absolute top-0 left-0 w-full h-section-height z-1 bg-gradient-to-b
       from-cyan-100/60'></div>

        {/* left column */}
        <div className='flex-1 max-w-2xl z-10 text-gray-500'>
          <h1 className='text-2xl md:text-3xl lg:text-4xl
         font-semibold text-gray-800 leading-tight'>{courseData.courseTitle}</h1>
          <p className='pt-3 md:text-base text-sm line-clamp-3'
            dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}></p>

          {/* review and ratings */}
          <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
            <p>{calculateRating(courseData)}</p> {/* Average Ratings */}
            <div className='flex'>
              {[...Array(5)].map((_, i) => (<img key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star :
                assets.star_blank} alt='' className='w-3.5 h-3.5' />
              ))}
            </div>
            <p className='text-blue-600'>({courseData.courseRatings.length} {courseData.courseRatings.length > 1 ? 'ratings'
              : 'rating'})</p> {/* Review Count */}

            <p>{courseData.enrolledStudents.length} {courseData.enrolledStudents.length > 1 ? 'students' : 'student'}</p>
          </div>
          <p className='text-sm'>Course By <span className='text-blue-600 underline'>{courseData.educator.name}</span></p>

          <div className='pt-8 text-gray-800'>
            <h2 className='text-xl font-semibold'>Course Structure</h2>
            <div className='pt-5 space-y-2'>
              {courseData.courseContent.map((chapter, index) => (
                <div key={index} className='border border-gray-300 bg-white rounded overflow-hidden'>
                  <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50 transition-colors'
                    onClick={() => toggleSection(index)}>
                    <div className='flex items-center gap-2 flex-1 min-w-0'>
                      <img className={`transform transition-transform flex-shrink-0 ${openSections[index] ? 'rotate-180' : ''}`}
                        src={assets.down_arrow_icon} alt="arrow icon" />
                      <p className='font-medium md:text-base text-sm truncate'>{chapter.chapterTitle}</p>
                    </div>
                    <p className='text-xs md:text-sm text-gray-600 ml-2 flex-shrink-0'>{chapter.chapterContent.length} lectures -
                      {calculateChapterTime(chapter)}</p>
                  </div>

                  <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-[500px] overflow-y-auto' :
                    'max-h-0'}`}>
                    <ul className='list-none pl-4 md:pl-6 pr-4 py-2 text-gray-600 border-t border-gray-300 space-y-2'>
                      {chapter.chapterContent.map((lecture, i) => {
                        const lectureId = `${index}-${i}`;
                        return (
                          <li key={i} className='py-1.5'>
                            <div className='flex items-start gap-2'>
                              <img src={assets.play_icon} alt="play icon" className='w-4 h-4 mt-1 flex-shrink-0' />
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-sm gap-2 min-w-0'>
                                  <p className='truncate flex-1'>{lecture.lectureTitle}</p>
                                  <div className='flex gap-2 flex-shrink-0'>
                                    {lecture.isPreviewFree && <p
                                      onClick={() => setPlayerData({
                                        videoId: lecture.lectureUrl.split('/').pop()
                                      })}
                                      className='text-blue-500 cursor-pointer hover:underline'>Preview</p>}
                                    <p className='text-gray-500'>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
                                  </div>
                                </div>

                                {/* AI Summary Button - Only for enrolled students */}
                                {isAlreadyEnrolled && (
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
                                )}
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
          </div>

          <div className='py-10 text-sm md:text-base'>
            <h3 className='text-xl font-semibold text-gray-800'>Course Description</h3>
            <div className='pt-3 rich-text max-w-full overflow-x-auto'
              dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}></div>
          </div>

        </div>


        {/* right column */}
        <div className='w-full md:w-[400px] lg:w-[450px] z-10 shadow-lg rounded-lg overflow-hidden bg-white flex-shrink-0 md:sticky md:top-20'>
          {
            playerData ?
              <YouTube videoId={playerData.videoId} opts={{ playerVars: { autoplay: 1 } }} iframeClassName='w-full aspect-video' />
              : <img src={courseData.courseThumbnail} alt="" className='w-full object-cover' />
          }

          <div className='p-5'>
            <div className='flex items-center gap-2'>
              <img className='w-3.5' src={assets.time_left_clock_icon} alt="time left clock icon" />
              <p className='text-red-500'><span className='font-medium'>5 days</span> left at this price</p>
            </div>

            <div className='flex gap-3 items-center pt-2'>
              <p className='text-gray-800 md:text-3xl text-2xl font-semibold'>{currency}{(courseData.coursePrice -
                courseData.discount * courseData.coursePrice / 100).toFixed(2)}</p>
              <p className='md:text-lg text-gray-500 line-through'>{currency}{courseData.coursePrice}</p>
              <p className='md:text-lg text-gray-500'>{courseData.discount}% off</p>
            </div>

            <div className='flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500'>
              <div className='flex items-center gap-1'>
                <img src={assets.star} alt="star icon" />
                <p>{calculateRating(courseData)}</p>
              </div>

              <div className='h-4 w-px bg-gray-500/40'></div>

              <div className='flex items-center gap-1'>
                <img src={assets.time_clock_icon} alt="clock icon" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>

              <div className='h-4 w-px bg-gray-500/40'></div>

              <div className='flex items-center gap-1'>
                <img src={assets.lesson_icon} alt="clock icon" />
                <p>{calculateNoOfLectures(courseData)} lessons </p>
              </div>

            </div>

            <button onClick={enrollCourse} className='md:mt-5 mt-4 w-full py-2.5 rounded bg-blue-600 text-white font-medium'>
              {isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}</button>

            <div className='pt-6'>
              <p className='md:text-xl text-lg font-medium text-gray-800 pt-2'>What's in the
                course?</p>
              <ul className='ml-4 pt-2 text-sm md:text-default list-disc text-gray-500'>
                <li>Lifetime access with free updates.</li>
                <li>Step by Step hands on project guidance</li>
                <li>Beginner to intermediate friendly</li>
                <li>Learn by building a real application</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
      <Footer />
    </>
  ) : <Loading />
}

export default CourseDetails
