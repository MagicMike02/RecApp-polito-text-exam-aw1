import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
	.use(HttpApi) // Carica i file .json da /public/locales
	.use(LanguageDetector) // Rileva la lingua del browser
	.use(initReactI18next) // Lega i18next a React
	.init({
		fallbackLng: 'en',
		supportedLngs: ['en', 'it'],
		debug: false,
		backend: {
			loadPath: '/locales/{{lng}}/translation.json',
		}
	});

export default i18n;



