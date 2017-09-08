project('pithos', 'c',
  version: '2.0.0',
  meson_version: '>= 0.42.0',
  default_options: [
    'c_std=gnu99',
    'warning_level=3',
    'buildtype=release',
  ]
)

i18n = import('i18n')
gnome = import('gnome')

subdir('data')
subdir('lib')
subdir('bin')
subdir('po')
meson.add_install_script('build-aux/meson/postinstall.py')
