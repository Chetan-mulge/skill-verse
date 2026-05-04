import React from 'react'
import { assets } from '../../assets/assets'

const CallToAction = () => {
  return (
    <div className='flex flex-col items-center gap-4 pt-6 pb-16 px-8 md:px-0'>
      <h1 className='text-xl md:text-3xl text-gray-800 font-semibold'>Learn anything, anytime, anywhere</h1>
      <p className='text-gray-500 sm:text-sm'>Join millions of learners taking the next step in their career 
        or passion <br />all it takes is a click to start your first lesson</p>
        <div className='flex items-center font-medium gap-6 mt-4'>
          <button className='px-8 py-2 rounded-md text-white bg-blue-600'>Get Started</button>
          <button className='flex items-center gap-2'>Learn more <img src={assets.arrow_icon} alt="arrow_icon" />
          </button>
        </div>
    </div>
  )
}

export default CallToAction
