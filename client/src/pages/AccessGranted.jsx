import { useNavigate } from 'react-router-dom'

const AccessGranted = () => {
  const navigate = useNavigate()

  return (
    <div className="relative flex h-screen min-h-[700px] w-full flex-col overflow-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Progress Header */}
            <header className="w-full p-4">
              <div className="flex flex-col gap-3">
                <div className="flex gap-6 justify-between items-center">
                  <p className="text-[#EAEAEA] text-base font-medium leading-normal">
                    ONBOARDING COMPLETE [4/4]
                  </p>
                </div>
                <div className="rounded bg-[#223f49]">
                  <div className="h-2 rounded bg-primary" style={{ width: '100%' }}></div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 flex-col items-center justify-center text-center">
              {/* Glow Ring Animation */}
              <div className="relative flex items-center justify-center w-[300px] h-[300px] mb-8">
                <div className="glow-ring"></div>
              </div>

              <h1 className="text-[#EAEAEA] tracking-light text-[32px] md:text-[40px] font-bold leading-tight px-4 text-center pb-3 pt-6">
                &gt; ACCESS GRANTED
              </h1>
              <p className="text-[#EAEAEA] text-lg font-normal leading-normal pb-3 pt-1 px-4 text-center">
                Welcome to KeyChat Control Network.
              </p>

              <div className="flex justify-center w-full mt-8">
                <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded h-12 px-5 bg-primary text-background-dark text-base font-bold leading-normal tracking-[0.015em] w-full transition-all duration-300 hover:shadow-glow-cyan hover:bg-opacity-90"
                  >
                    <span className="truncate">[ENTER DASHBOARD]</span>
                  </button>
                  <button
                    onClick={() => navigate('/join-room')}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded h-12 px-5 bg-transparent border border-primary/50 text-[#EAEAEA] text-base font-bold leading-normal tracking-[0.015em] w-full transition-all duration-300 hover:bg-primary/20 hover:border-primary"
                  >
                    <span className="truncate">[JOIN WITH KEY]</span>
                  </button>
                </div>
              </div>
            </main>

            <footer className="w-full p-4"></footer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessGranted
