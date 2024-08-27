import TaskBar from './components/TaskBar/TaskBar';
import LangProvider from './context/LangContext';

function Main() {

  return (
    <>
    <LangProvider>
      <ul>
        <li>Ajouter un composant icônes</li>
        <li>Ajouter les icônes à la chaîne avec leurs images</li>
      </ul>
      <TaskBar/>
    </LangProvider>
    </>
  );
}

export default Main;
