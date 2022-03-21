import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Nominal from '../views/Nominal.vue';
import EquipmentData from '../views/EquipmentData.vue';
import SetVolumes from '../views/SetVolumes.vue';
import MeasurementTask from '../views/MeasurementTask.vue';
import MeasurementFill from '../views/MeasurementFill.vue';
import Protocol from '../views/Protocol.vue';

export const stepRoutes = [
  {
    path: '/',
    name: 'Введение',
    component: Home,
  },
  {
    path: '/nominal',
    name: 'Номинал изделия',
    component: Nominal,
  },
  {
    path: '/equipment-data',
    name: 'Испытательное оборудование',
    component: EquipmentData,
  },
  {
    path: '/set-volumes',
    name: 'Деление на элементы',
    component: SetVolumes,
  },
  {
    path: '/measurement-task',
    name: 'Задание на измерения',
    component: MeasurementTask,
  },
  {
    path: '/measurement-fill',
    name: 'Заполнение измерений',
    component: MeasurementFill,
  },
  {
    path: '/protocol',
    name: 'Протокол',
    component: Protocol,
  },
];

const otherRoutes = [];

const router = createRouter({
  history: createWebHashHistory(),
  routes: [stepRoutes, otherRoutes].flat(),
});

export default router;
