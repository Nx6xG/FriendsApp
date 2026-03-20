import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let bgColor = UIColor(red: 10/255, green: 12/255, blue: 18/255, alpha: 1)
        window?.backgroundColor = bgColor

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            self.configureWebView()
        }
        return true
    }

    private func configureWebView() {
        guard let rootVC = window?.rootViewController else { return }

        let bridgeVC: CAPBridgeViewController?
        if let cap = rootVC as? CAPBridgeViewController {
            bridgeVC = cap
        } else if let nav = rootVC as? UINavigationController,
                  let cap = nav.viewControllers.first as? CAPBridgeViewController {
            bridgeVC = cap
        } else {
            bridgeVC = nil
        }

        guard let vc = bridgeVC, let webView = vc.webView else {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                self.configureWebView()
            }
            return
        }

        let bgColor = UIColor(red: 10/255, green: 12/255, blue: 18/255, alpha: 1)

        // Edge-to-edge: content extends behind status bar and home indicator
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.isOpaque = true
        webView.backgroundColor = bgColor
        webView.scrollView.backgroundColor = bgColor
        webView.scrollView.bounces = false
        webView.scrollView.alwaysBounceVertical = false
        webView.scrollView.alwaysBounceHorizontal = false
        webView.allowsBackForwardNavigationGestures = true

        vc.edgesForExtendedLayout = .all
        vc.extendedLayoutIncludesOpaqueBars = true
        vc.view.backgroundColor = bgColor

        // Inject the REAL safe area insets from UIKit into CSS variables.
        // This is the only reliable way — env() doesn't work with .never adjustment.
        let insets = vc.view.safeAreaInsets
        let js = """
        document.documentElement.style.setProperty('--safe-top', '\(insets.top)px');
        document.documentElement.style.setProperty('--safe-bottom', '\(insets.bottom)px');
        """
        webView.evaluateJavaScript(js)

        // Also inject after a delay in case the page hasn't loaded yet
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            let insets = vc.view.safeAreaInsets
            let js = """
            document.documentElement.style.setProperty('--safe-top', '\(insets.top)px');
            document.documentElement.style.setProperty('--safe-bottom', '\(insets.bottom)px');
            """
            webView.evaluateJavaScript(js)
        }

        // And after 1 second as a final guarantee
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            let insets = vc.view.safeAreaInsets
            let js = """
            document.documentElement.style.setProperty('--safe-top', '\(insets.top)px');
            document.documentElement.style.setProperty('--safe-bottom', '\(insets.bottom)px');
            """
            webView.evaluateJavaScript(js)
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationDidBecomeActive(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
