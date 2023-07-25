import { useRouter } from 'next/router'
import en from '../public/lang/en.js'
import ja from '../public/lang/ja.js'

const useTrans = () => {
    const { locale } = useRouter()

    const trans = locale === 'ja' ? ja : en

    return trans
}

export default useTrans
