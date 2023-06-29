import { initialize_mode, xp_options } from '$v3/components/drop-down-menu/App/experience/store'
import { isSelected } from '../../backend-frontend/option'

export function isIntersection_selectedValid() {
  return isIntersectionSeletectd() && isInputBufferSelected() // the only place where it is available
}

export function isInputSelected() {
  return isSelected(initialize_mode, 'input')
}
function isIntersectionSeletectd() {
  return isSelected(xp_options, 'try_to_load_when_rendered')
}
function isInputBufferSelected() {
  return isSelected(initialize_mode, 'input_x_buffer')
}
