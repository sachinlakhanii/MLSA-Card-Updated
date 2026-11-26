/* Entry point */
import { initDots } from './dots.js';
import { initCard } from './card.js';
import { initEditor } from './editor.js';
import { initDownload } from './export.js';
import { initPublish } from './publish.js';
import { initMembers } from './members.js';
import { initPresentation } from './card-presentation.js';

initDots();
initCard();
initPresentation();
initEditor();
initDownload();
initPublish();
initMembers();

import { initStudioUI } from './studio-ui.js';
initStudioUI();

import { initBack } from './back.js';
initBack();
