import './ui/styles/fantasy-tokens.css';
import './ui/styles/fantasy-layout.css';
import { FantasyApp } from './ui/FantasyApp';

document.addEventListener('DOMContentLoaded', () => {
  const appRoot = document.getElementById('app');
  if (appRoot) {
    (window as any).fantasyApp = new FantasyApp(appRoot);
  }
});
