import { runProcessThemeQueue } from './processQueuedThemes';
import { runSyncThemesFromGitHub } from './syncThemesFromGitHub';

// on initial start, always sync
void runSyncThemesFromGitHub();

// todo: ideally a cronjob should be used to only spin up job pod when required
// but nvm this is good enough for now
setInterval(() => runProcessThemeQueue, 900000);
setInterval(() => runSyncThemesFromGitHub, 86400000);
 