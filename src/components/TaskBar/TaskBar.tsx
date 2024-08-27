import LangSwitcher from './LangSwitcher/LangSwitcher';
import StartButton from './StartButton/StartButton';

import './TaskBar.scss';

const TaskBar = () => {
  return (
    <div className='task-bar'>
      <StartButton />
      <LangSwitcher />
    </div>
  )
}

export default TaskBar;