import Navbar from './Navbar'

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-background flex">
            <Navbar />
            <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 min-h-screen bg-background">
                {children}
            </main>
        </div>
    )
}
