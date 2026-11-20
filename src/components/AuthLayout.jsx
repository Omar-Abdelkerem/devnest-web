import VolumetricBackground from './VolumetricBackground'

export default function AuthLayout({ children }) {
  return (
    <div className="relative flex-1 flex flex-col justify-center items-center px-4 py-14 min-h-full overflow-hidden">
      <VolumetricBackground variant="hero" />
      <div className="relative z-10 w-full max-w-[440px]">
        {children}
      </div>
    </div>
  )
}
