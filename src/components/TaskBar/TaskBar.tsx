import Clock from './Clock/Clock'
import LangSwitcher from './LangSwitcher/LangSwitcher'
import StartButton from './StartButton/StartButton'

import './TaskBar.scss'

const TaskBar = () => {
  return (
    <div className="taskbar">
      <StartButton />

      <div className="taskbar__right">
        <LangSwitcher />
        <Clock />
      </div>
    </div>
  )
}

export default TaskBar
