import { MultiSelect } from 'primereact/MultiSelect'
import { Dropdown } from 'primereact/dropdown'
import type { MenuItem } from 'primereact/menuitem'
import { SlideMenu } from 'primereact/slidemenu'
import { ToggleButton } from 'primereact/togglebutton'

import { useEffect, useRef, useState } from 'preact/hooks'
import 'primereact/multiselect/multiselect.min.css'
import 'primereact/slidemenu/slidemenu.min.css'

function onFirstRef(cb: (ref: any) => void) {
  // https://usehooks-ts.com/react-hook/use-is-first-render
  const isFirst = useRef(true)
  const ref = useRef(null)

  useEffect(() => {
    if (isFirst.current && ref.current) {
      isFirst.current = false

      cb(ref)
    }
  }, [])
  return ref
}

function Item(props: any): [] {
  return {
    ...props,
    template() {
      return (
        <li class="p-menuitem">
          <a href="#" class="p-menuitem-link">
            <span class={`p-menuitem-icon ${props.icon}`}></span>
            {props.template()}
          </a>
        </li>
      )
    },
  }
}

export function App() {
  const items: MenuItem[] = [
    {
      label: 'Deployment Style',
      // @ts-ignore
      tooltip: 'Look for components to create YT GIFs',
      icon: 'pi pi-fw pi-file',
      items: [
        {
          /* @ts-expect-error */
          label: 'Tutorials',
          icon: 'pi pi-fw pi-plus',
          style: { padding: '0.55rem 0.55rem' },
          template() {
            const [selectedCity, setSelectedCity] = useState(null)

            const cities = [{ name: 'Deployments', tooltip: 'Deploy selected YT GIFs', code: 'NY' }]
            return (
              <div className="card flex justify-content-center">
                <span className="p-float-label">
                  {/* @ts-expect-error */}
                  <Dropdown
                    inputId="dd-tutorials"
                    showClear
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.value)}
                    options={cities}
                    optionLabel="name"
                    style={{ width: '100%' }}
                  />
                  <label htmlFor="dd-tutorials">Tutorials</label>
                </span>
              </div>
            )
          },
        },
        Item({
          label: 'Targets',
          icon: 'pi pi-fw pi-plus',
          template() {
            const [selectedCities, setSelectedCities] = useState<any | null>(null)
            const tarets = [
              { name: 'youtube', code: 'Any Youtube Video Link' },
              { name: 'linklip', code: 'Any Linklip component' },
            ]

            return (
              <span className="p-float-label">
                {/* @ts-expect-error */}
                <MultiSelect
                  inputId="dd-targets"
                  value={selectedCities}
                  onChange={(e: any) => setSelectedCities(e.value)}
                  options={tarets}
                  display="chip"
                  optionLabel="name"
                  placeholder="Targets"
                />{' '}
                <label htmlFor="dd-targets">Targets</label>
              </span>
            )
          },
        }),
        Item({
          icon: 'pi pi-fw pi-trash',
          template() {
            const [checked, setChecked] = useState(false)

            return (
              <div>
                {/* @ts-expect-error */}
                <ToggleButton
                  onLabel="Deploy"
                  offLabel="Erase"
                  checked={checked}
                  onChange={e => setChecked(e.value)}
                />
              </div>
            )
          },
        }),
        Item({
          icon: 'pi pi-fw pi-link',
          template() {
            const [checked, setChecked] = useState(false)

            return (
              // @ts-expect-error
              <ToggleButton
                onLabel="Turn On"
                offLabel="Turn Off"
                checked={checked}
                onChange={e => setChecked(e.value)}
              />
            )
          },
        }),
      ],
    },
  ]

  return (
    <div className="card flex justify-content-center">
      {/* @ts-expect-error */}
      <SlideMenu
        // @ts-expect-error
        ref={onFirstRef(menu => {
          // setLevel api does not work
          menu.current?.getElement().querySelector('.p-menuitem-link').click()
        })}
        model={items}
        viewportHeight={250}
        menuWidth={190}
      ></SlideMenu>
    </div>
  )
}
