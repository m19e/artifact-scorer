import { ThemeList } from "@/components/organisms/Theme"
import { Config } from "@/components/organisms/Config"

export const Header = () => {
  return (
    <div className="md:max-w-lg navbar bg-neutral text-neutral-content md:rounded-b-box">
      <div className="navbar-start">
        <a className="text-2xl normal-case btn btn-ghost">#ArtifactScorer</a>
      </div>
      <div className="navbar-center"></div>
      <div className="navbar-end">
        <ThemeList />
        <Config />
      </div>
    </div>
  )
}
