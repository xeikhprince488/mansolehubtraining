import Topbar from "@/components/layout/Topbar"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Topbar />
      {children}
      <Analytics />
      <SpeedInsights />
      <footer className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Contact Section */}
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-4 text-blue-400">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm">📞</span>
                  </div>
                  <span className="text-gray-300 hover:text-white transition-colors">03224700200</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm">📞</span>
                  </div>
                  <span className="text-gray-300 hover:text-white transition-colors">03054700222</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm">📞</span>
                  </div>
                  <span className="text-gray-300 hover:text-white transition-colors">03054700202</span>
                </div>
              </div>
            </div>

            {/* Center Logo/Brand */}
            <div className="text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                MansolhabTrainings
              </h2>
              <p className="text-gray-400 text-sm">
                Empowering minds through innovative learning
              </p>
            </div>

            {/* Quick Info */}
            <div className="text-center md:text-right">
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Support</h3>
              <div className="space-y-2">
                <p className="text-gray-300 text-sm">24/7 Customer Service</p>
                <p className="text-gray-300 text-sm">Technical Support</p>
                <p className="text-gray-300 text-sm">Learning Assistance</p>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-sm">
                  © 2024 Learning Management System. All rights reserved.
                </p>
              </div>
              <div className="flex space-x-6">
                <span className="text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </span>
                <span className="text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </span>
                <span className="text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                  Help Center
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default HomeLayout