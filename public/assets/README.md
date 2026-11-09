# Add the scene assets

The application intentionally does not include a sample photograph or an unrelated depth map. Add exactly one first-person-view photograph generated/selected for this project as `scene.jpg`, and generate a grayscale depth map from that exact photograph as `scene-depth.png`.

Requirements:
- Both files have identical width and height.
- The depth map is grayscale; near/far interpretation is relative and may be reversed depending on the model/tool used.
- Keep the source and depth map together when preparing and checking them; unrelated depth maps are not compatible.
- Do not add alternate scenes; the app references only these two paths.

Paths expected by the frontend: `/assets/scene.jpg` and `/assets/scene-depth.png`.
