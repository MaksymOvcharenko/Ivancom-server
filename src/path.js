// import { log } from 'node:console';
import path from 'node:path';

// приклад для побудови шляху із його частин
const pathToWorkDir = path.join(process.cwd()); // отримуємо шлях до кореневої директорії викликом метода process.cwd()
// export const pathToFile = path.join(pathToWorkDir, 'src', 'text.txt');
export const pathToFile = (name) => {
  return path.join(pathToWorkDir, 'src', name);
};
// розширюємо шлях додатковими елементами
// pathToFile на MacOs буде __шлях до папки, де запущений процес__/some_folder/some_file.txt'
// pathToFile на Windows буде __шлях до папки, де запущений процес__\\some_folder\\some_file.txt'
