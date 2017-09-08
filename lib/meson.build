pkglibdir = join_paths(get_option('libdir'), meson.project_name())

sources = [
  'pithos-crypt.c',
]

headers = [
  'pithos-crypt.h',
]

libpithos = shared_library('pithos', sources,
  dependencies: [
    dependency('glib-2.0'),
    dependency('nettle'),
  ],
  pic: true,
  install: true,
  install_dir: pkglibdir,
)

libpithos_gir = gnome.generate_gir(libpithos,
  sources: sources + headers,
  nsversion: '1.0',
  namespace: 'Pithos',
  symbol_prefix: 'pithos',
  identifier_prefix: 'Pithos',
  install: true,
  install_dir_gir: false,
  install_dir_typelib: join_paths(pkglibdir, 'girepository-1.0'),
)
