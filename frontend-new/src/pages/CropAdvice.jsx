import CropAdviceCard from '../components/CropAdviceCard'

export default function CropAdvice() {
    return (
        <div className="animate-fade-in p-6 lg:p-8 flex flex-col items-center">
            <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                        Crop Advice
                    </h1>
                </div>
                <p className="text-sm text-muted-fg">
                    Describe your crop issue and get expert AI-powered advice tailored to your location
                </p>
            </div>
            <div className="w-full max-w-xl">
                <CropAdviceCard />
            </div>
        </div>
    )
}
