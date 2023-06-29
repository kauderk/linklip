import { render } from 'preact'
import 'primeicons/primeicons.css'
import 'primereact/resources/primereact.min.css'
import 'primereact/resources/themes/mdc-dark-indigo/theme.css'
import { App } from './app.tsx'
import './index.css'

render(<App />, document.getElementById('app') as HTMLElement)
