import React from 'react'
import { assets } from '../../assets/assets'

const Companies = () => {
  return (
    <div className='pt-10'>
      <p className='text-base text-gray-500'>Trusted by learners from</p>
      <div className='flex flex-wrap items-center justify-center gap-5 md:gap-12
      md:mt-8 mt-4'>
        <img src={assets.microsoft_logo} alt="Microsoft" className='w-16 md:w-24' />
        <img src={assets.walmart_logo} alt="Walmart" className='w-16 md:w-24' />
        <img src={assets.accenture_logo} alt="Accenture" className='w-16 md:w-24' />
        <img src={assets.adobe_logo} alt="Adobe" className='w-16 md:w-24' />
        <img src={assets.paypal_logo} alt="Paypal" className='w-16 md:w-24' />
      </div>
    </div>
  )
}

export default Companies
