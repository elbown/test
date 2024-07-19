# Storius Mobile

## Getting Started

**File Structure**
```
.
├── android # Android folder
├── assets # Store all the static files in app
├── build # Build folder
├── ios # IOS folder
├── lib # This folder contains all the files needed in the app
│   ├── common (some files utils, widget custom, routes, themes ...)
│   ├── features   
│         ├── feature (ex: login)
│               ├── data (remote data: call API or local data: Hive, SQLite)        
│               ├── blocs (listen event, handle bussiness login and emit state changed)
│                ├── pages (UI like: screen or custom widget...)
└── test
```

**State Manager**

Flutter BloC lib: 
![image](https://user-images.githubusercontent.com/41661101/189514010-9e400b55-84d9-4c4f-be03-f7010dde2f0f.png)

docs: https://pub.dev/packages/flutter_bloc

**Remote API**

- Custom Dio HTTP header.
 docs: https://pub.dev/packages/dio


## Development Environment
Clone the repo with
```bash
git clone https://github.com/storiusApp/storius-app.git
```

Check Flutter with
```bash
flutter doctor
```
and fix warnings/errors it brings up.

Connect an Android/iOS device or emulator with the [Google Play Store installed](https://stackoverflow.com/a/72730948), and run
```bash
flutter pub get
flutter run --flavor develop -t lib/main_development.dart # Run Dev Loop 
```

### Android
`flutter run` will probably result in failure. As such, we should add the following line to `android/local.properties`
Create two config files as below in `android/`:
```properties
# other pregenerated properties ...

flutter.minSdkVersion=24
```

Run again
```bash
flutter run --flavor develop -t lib/main_development.dart # Run Dev Loop 
```

## Scripts
Scripts that help the development and build process are found in `scripts/`.
### `scripts/lang_file_generator.py`
This script helps convert the [lang](https://n0job6arm7.larksuite.com/sheets/shtusZxRDIY077BIJKrFZ9hsPLd?sheet=kex8fm) file into `assets/languages/*.json` files used in this repo.

Directions:

1. Open the [lang](https://n0job6arm7.larksuite.com/sheets/shtusZxRDIY077BIJKrFZ9hsPLd?sheet=kex8fm) file in a browser. Select (...) button at top right > Download as > `.csv`
2. `cd` into the root directory of this repo
3. Run
   ```bash
	python3 ./scripts/lang_file_generator.py /path/to/csv/file
	# or to specify output dir
	python3 ./scripts/lang_file_generator.py /path/to/csv/file -o /output/dir
	```
4. Profit 😋

It is recommended to review the changes made with git before committing.