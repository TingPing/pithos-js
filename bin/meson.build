pkgdatadir = join_paths(get_option('datadir'), meson.project_name())
gnome = import('gnome')

src_res = gnome.compile_resources('io.github.Pithos.src',
  'io.github.Pithos.src.gresource.xml',
  source_dir: '../src',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
)

data_res = gnome.compile_resources('io.github.Pithos.data',
  'io.github.Pithos.data.gresource.xml',
  source_dir: '../src',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
)

gjs = find_program('gjs')
ret = run_command(gjs, '--version')
if ret.returncode() != 0
  error('Failed to run gjs')
endif
if not ret.stdout().strip().split()[1].version_compare('>= 1.50.0')
  error('gjs >= 1.50.0 required')
endif

bin_conf = configuration_data()
bin_conf.set('GJS', gjs.path())
bin_conf.set('PACKAGE_VERSION', meson.project_version())
bin_conf.set('PACKAGE_NAME', meson.project_name())
bin_conf.set('prefix', get_option('prefix'))
bin_conf.set('libdir', join_paths(get_option('prefix'), get_option('libdir')))
bin_conf.set('datadir', join_paths(get_option('prefix'), get_option('datadir')))

configure_file(
  input: 'io.github.Pithos.in',
  output: 'io.github.Pithos',
  configuration: bin_conf,
  install: true,
  install_dir: get_option('bindir')
)
