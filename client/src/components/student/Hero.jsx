import React from 'react'
import { assets } from '../../assets/assets'
import SearchBar from './SearchBar'

const Hero = () => {
  return (

    <div className='flex flex-col items-center justify-center w-full md:pt-24 pt-12 px-7 md:px-0 space-y-5 text-center
    bg-gradient-to-b from-cyan-100/70'>

     <h1 className='md:text-home-heading-large text-home-heading-small relative font-bold text-gray-800 max-w-3xl mx-auto'>
      Shape your future with learning paths tailored <span className='text-blue-600'>just for you.</span>
     <img src={assets.sketch} alt="sketch" className='md:block hidden absolute -bottom-7 right-0'/></h1>

     <p className='md:block hidden text-gray-500 max-w-2xl mx-auto'>We unite top-tier educators, engaging materials, 
      and a strong network to support you in reaching your individual and career ambitions.</p>

     <p className='md:hidden text-gray-500 max-w-sm mx-auto'> We bring together world-class instructors to help
      you achieve your personal and professional goals. </p>

      <SearchBar/>
    </div>
  )
}

export default Hero
