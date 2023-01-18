import { IExecutor } from './Executor';
import ITask from './Task';

export default async function run(executor: IExecutor, queue: AsyncIterable<ITask>, maxThreads = 0) {
    maxThreads = Math.max(0, maxThreads);

    /**
     * Код надо писать сюда
     * Тут что-то вызываем в правильном порядке executor.executeTask для тасков из очереди queue
     */
    
    const arr: ITask[] = []; // Тут будем хранить массив задач из очереди

    for await (let item of queue) { // Асинхронный цикл для добавления поступающих задач в массив задач
        if (!arr.some((el) => el.targetId === item.targetId)) arr.push(item); // Добавляем только уникальные задачи
    }

    while (arr.length) { // Пока в массиве задач есть задачи, делаем следующее:
        let currentQueue: ITask[] = []; // Создаем текущий (временный) массив задач для данной итерации
        if (maxThreads < arr.length && maxThreads !== 0) { // Если колчество потоков меньше количества задач (но не равно 0), то:
            currentQueue = arr.splice(0, maxThreads) // забираем из массива столько задач, сколько у нас потоков
        } else {
            currentQueue = arr.splice(0, arr.length) // иначе забираем все остальное
        }

        let array = currentQueue.map(task => new Promise(() => executor.executeTask(task))) // создаем промис для каждой выбранной таски

        await Promise.all(array); // выполняем их
    }

    executor.stop(); // завершаем, когда все задачи выполнены
}
