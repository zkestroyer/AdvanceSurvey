plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.example.advance_telecom_app"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.example.advance_telecom_app"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    packaging {
        resources.excludes.add("META-INF/Icon\r")
        resources.excludes.add("META-INF/Icon*")
        resources.excludes.add("META-INF/Icon")
        resources.excludes.add("**/Icon\r")
        resources.excludes.add("**/Icon*")
        resources.excludes.add("**/Icon")
        jniLibs.excludes.add("**/Icon\r")
        jniLibs.excludes.add("**/Icon*")
        jniLibs.excludes.add("**/Icon")
    }
}

flutter {
    source = "../.."
}
