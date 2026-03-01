import { useTranslation } from 'react-i18next'
import WeatherCard from '../components/WeatherCard'
import DiseasePredictionCard from '../components/DiseasePredictionCard'
import CropAdviceCard from '../components/CropAdviceCard'

export default function Home() {
    const { t } = useTranslation()

    return (
        <div className="animate-fade-in p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                    {t('dashboard.title')}
                </h1>
                <p className="mt-1 text-sm text-muted-fg">
                    {t('dashboard.subtitle')}
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <WeatherCard />
                <DiseasePredictionCard />
                <CropAdviceCard />
            </div>
        </div>
    )
}