"use client";
import dynamic from 'next/dynamic';

 
const SignUpForm = dynamic(() => import('../component/layout/SignUpForm'), { 
  ssr: false 
});

const page = () => {
  return (
    <SignUpForm />
  )
}

export default page