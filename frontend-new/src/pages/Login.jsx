import React, { useState } from 'react'
import { verifyOtp, genOtp } from '../api_services/api_services';
import { setToken } from '../utils/Auth';

const Login = () => {

    const userTypes = ["Farmer", "Expert", "Admin"]
    const [userType, setUserType] = useState(userTypes[0]);
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [state, setState] = useState(0); // 0: enter mobile, 1: enter otp
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        // Implement OTP verification logic here
        if(state == 0) {
            console.log(`Selected user type: ${userType}, ${state}`);
            console.log(`Sending OTP to ${mobileNumber} as ${userType}`);
            if (!/^\d{10}$/.test(mobileNumber)) {
                setError("Please enter a valid 10-digit mobile number");
                return;
            }
            try{
                console.log("Generating OTP...");
                const response = await genOtp(mobileNumber);
                if (response && response.success) {
                    console.log("OTP generated successfully");
                } else {
                    setError("Failed to generate OTP. Please try again.");
                    return;
                }
            }
            catch(err){
                setError("Failed to send OTP. Please try again.");
                console.error(err);
                return;
            }
            
            setError("")
            setState(1);
        } else {
            if (!/^\d{6}$/.test(otp)) {
                setError("Please enter a valid 6-digit OTP");
                return;
            }
            try {
                const response = await verifyOtp(mobileNumber, otp);
                if (response && response.success) {
                    // OTP verified successfully, handle login logic here
                    await setToken(response.access_token);
                    console.log("OTP verified successfully");
                } else {
                    setError("Invalid OTP. Please try again.");
                    return;
                }
            }
            catch(err){
                setError("Failed to verify OTP. Please try again.");
                return;
            }
        }
        console.log(`Verifying OTP ${otp} for mobile number ${mobileNumber} as ${userType}`);
    }
    

    return (
        <>
            <div className="h-[100vh] w-screen m-0 border-0  flex items-center justify-center">
                <div className='h-fit w-100 rounded-xl backdrop-blur-xl border border-green-800/10 shadow-[0_12px_30px_rgba(46,125,50,0.27)]'>
                    <div className='h-[13%] min-h-12 flex justify-evenly rounded-xl'>
                        {userTypes.map((user) => {
                            return (<>
                                <div key={user} className={`w-1/3
                                    flex items-center justify-center
                                    text-lg font-medium
                                    cursor-pointer
                                    ${(userType == user) ? "bg-[#16A34A] text-white shadow-md" : "bg-[#E8F5E9] text-[#2E7D32]"}
                                    border-b border-green-900/10
                                    border-r border-green-900/10
                                    last:border-r-0
                                    last:rounded-tr-xl
                                    first:rounded-tl-xl
                                    
                                    hover:text-green-900
                                    transition-all duration-100
                                    `} onClick={() => { setUserType(user) }}>
                                    {user}
                                </div>
                            </>)

                        })}
                    </div>

                    <div className="flex flex-col px-8 py-10 space-y-6 h-[87%] justify-center">

                        {(state === 0)?<><div className='text-xl font-bold'>Login as {userType}</div><div className="flex flex-col items-start space-y-1">
                            <label className="text-sm font-medium text-green-900 ml-1 justify-start">Mobile Number</label>
                            <input
                                required
                                type="tel"
                                placeholder={`Enter Mobile Number`}
                                className="w-full px-2.5 py-2 rounded-lg bg-green-50/50 border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all placeholder:text-gray-400 text-gray-800 font-medium"
                                onChange={(e)=>{setMobileNumber(e.target.value); }}
                            />
                            {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
                        </div>
                        </>:<>
                        <div className='text-md'>Enter OTP sent to {mobileNumber}</div>
                        <div className="flex flex-col items-start space-y-1">
                            <label className="text-sm font-medium text-green-900 ml-1">OTP</label>
                            <div className="flex gap-3 ">
                                <input
                                    required
                                    type="text"
                                    maxLength="6"
                                    placeholder="Enter 6-digit OTP"
                                    onChange={(e)=>{setOtp(e.target.value)}}
                                    className="w-full px-2.5 py-2 rounded-lg bg-green-50/50 border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all placeholder:text-gray-400 text-gray-800 font-medium"
                                />
                                <button className="px-2.5 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition-colors whitespace-nowrap shadow-sm cursor-pointer" >
                                    Resend OTP
                                </button>
                            </div>
                            {error && <div className="text-red-600 text-sm mt-1">{error}</div>}

                        </div>
                        </>}
                        

                        

                        <button className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg hover:shadow-green-900/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 mt-1 cursor-pointer" onClick={() => {
                            handleSubmit();
                        }}>
                            {(state) ? "Verify OTP" : "Send OTP"}
                        </button>
                        {state==1?<div className="text-md text-green-700 mt-1 cursor-pointer">Mistake in mobile number? <span className='underline text-blue-800' onClick={()=>{setMobileNumber(); setState(0); setError("");}}>Update it</span></div>:<></>}

                    </div>
                </div>
            </div>
        </>
    )
}

export default Login