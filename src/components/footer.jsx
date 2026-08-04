import { Mail, MapPin, Phone } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../lib/i18n'

function Footer() {
  const { t } = useLang()

  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">Djib Drive</div>
                  <div className="text-xs text-gray-400">
                    Premium Dealership
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                {t('footer.tagline')}
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-white">{t('footer.navigation')}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link to="/" className="hover:text-white transition">
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link to="/cars" className="hover:text-white transition">
                    {t('nav.cars')}
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-white transition">
                    {t('nav.services')}
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition">
                    {t('nav.about')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-white">{t('footer.services')}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>{t('footer.financing')}</li>
                <li>{t('footer.insurance')}</li>
                <li>{t('footer.tradein')}</li>
                <li>{t('footer.maintenance')}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-white">{t('footer.contact')}</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+253 25313664</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>contact@djibdrive.dj</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Djibouti City, Djibouti</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 Djib Drive. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
  )
}

export default Footer
