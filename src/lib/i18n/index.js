import { addMessages, init } from 'svelte-i18n';

import { DEFAULT_LOCALE } from './constants';
import en from './locales/en.json';
import zh from './locales/zh.json';
import ar from './locales/ar.json';
import ja from './locales/ja.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

addMessages('en', en);
addMessages('zh', zh);
addMessages('ar', ar);
addMessages('ja', ja);
addMessages('es', es);
addMessages('fr', fr);

init({ fallbackLocale: DEFAULT_LOCALE, initialLocale: DEFAULT_LOCALE });
