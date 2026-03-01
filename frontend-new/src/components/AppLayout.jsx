import Navbar from './Navbar'

export default function AppLayout({ children }) {
    return (
        <div className="min-h-dvh bg-background flex">
            <Navbar />
            <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 min-h-dvh bg-background flex flex-col">
                {children}
            </main>
        </div>
    )
}
