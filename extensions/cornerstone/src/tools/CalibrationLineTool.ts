import { LengthTool, utilities } from '@cornerstonejs/tools';
import { callInputDialog } from '@ohif/extension-default';
import getActiveViewportEnabledElement from '../utils/getActiveViewportEnabledElement';

const { calibrateImageSpacing } = utilities;

/**
 * Calibration Line tool works almost the same as the
 */
class CalibrationLineTool extends LengthTool {
  static toolName = 'CalibrationLine';

  // _renderingViewport: any;
  // _lengthToolRenderAnnotation = this.renderAnnotation;

  // renderAnnotation = (enabledElement, svgDrawingHelper) => {
  //   const { viewport } = enabledElement;
  //   this._renderingViewport = viewport;
  //   return this._lengthToolRenderAnnotation(enabledElement, svgDrawingHelper);
  // };

  _getTextLines(data, targetId) {
    // const [canvasPoint1, canvasPoint2] = data.handles.points.map(p =>
    //   this._renderingViewport.worldToCanvas(p)
    // );
    // // for display, round to 2 decimal points
    // const lengthPx = Math.round(calculateLength2(canvasPoint1, canvasPoint2) * 100) / 100;

    // const textLines = [`${lengthPx}px`];

    const textLines = ['Calibration Line'];

    return textLines;
  }
}

function calculateLength2(point1, point2) {
  const dx = point1[0] - point2[0];
  const dy = point1[1] - point2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateLength3(pos1, pos2) {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1];
  const dz = pos1[2] - pos2[2];

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Utility functions for localStorage scale management
export const CALIBRATION_SCALE_KEY = 'ohif_calibration_scale';

export function saveCalibrationScale(imageId: string, scale: number): void {
  try {
    const scales = getCalibrationScales();
    scales[imageId] = Number(scale.toFixed(2));
    localStorage.setItem(CALIBRATION_SCALE_KEY, JSON.stringify(scales));
    console.log(`Calibration scale ${scale} saved for image ${imageId}`);
  } catch (error) {
    console.warn('Failed to save calibration scale to localStorage:', error);
  }
}

export function getCalibrationScale(imageId: string): number | null {
  try {
    const scales = getCalibrationScales();
    return scales[imageId] || null;
  } catch (error) {
    console.warn('Failed to get calibration scale from localStorage:', error);
    return null;
  }
}

export function getCalibrationScales(): Record<string, number> {
  try {
    const stored = localStorage.getItem(CALIBRATION_SCALE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to parse calibration scales from localStorage:', error);
    return {};
  }
}

export function clearCalibrationScale(imageId?: string): void {
  try {
    if (imageId) {
      const scales = getCalibrationScales();
      delete scales[imageId];
      localStorage.setItem(CALIBRATION_SCALE_KEY, JSON.stringify(scales));
    } else {
      localStorage.removeItem(CALIBRATION_SCALE_KEY);
    }
  } catch (error) {
    console.warn('Failed to clear calibration scale from localStorage:', error);
  }
}

export function logAllCalibrationScales(): Record<string, number> {
  try {
    const scales = getCalibrationScales();
    console.log('All calibration scales:', scales);
    return scales;
  } catch (error) {
    console.warn('Failed to log calibration scales:', error);
    return {};
  }
}

// Test function to verify localStorage functionality
export function testCalibrationScale(): void {
  console.log('Testing calibration scale functionality...');

  // Test saving a scale
  const testImageId = 'test-image-123';
  const testScale = 2.5;
  saveCalibrationScale(testImageId, testScale);

  // Test retrieving the scale
  const retrievedScale = getCalibrationScale(testImageId);
  console.log(`Retrieved scale for ${testImageId}:`, retrievedScale);

  // Test getting all scales
  const allScales = getCalibrationScales();
  console.log('All scales after test:', allScales);

  // Clean up test data
  clearCalibrationScale(testImageId);
  console.log('Test completed successfully!');
}

export default CalibrationLineTool;

export function onCompletedCalibrationLine(
  servicesManager: AppTypes.ServicesManager,
  csToolsEvent
) {
  const { uiDialogService, viewportGridService } = servicesManager.services;

  // calculate length (mm) with the current Pixel Spacing
  const annotationAddedEventDetail = csToolsEvent.detail;
  const {
    annotation: { metadata, data: annotationData },
  } = annotationAddedEventDetail;
  const { referencedImageId: imageId } = metadata;
  const enabledElement = getActiveViewportEnabledElement(viewportGridService);
  const { viewport } = enabledElement;

  const length =
    Math.round(
      calculateLength3(annotationData.handles.points[0], annotationData.handles.points[1]) * 100
    ) / 100;

  const adjustCalibration = newLength => {
    const spacingScale = newLength / length;

    console.log(`Calibration: Original length: ${length}mm, New length: ${newLength}mm, Scale: ${spacingScale}`);

    // Save the scale to localStorage
    saveCalibrationScale(imageId, spacingScale);

    // trigger resize of the viewport to adjust the world/pixel mapping
    calibrateImageSpacing(imageId, viewport.getRenderingEngine(), {
      type: 'User' as any,
      scale: 1 / spacingScale,
    });
  };

  return new Promise((resolve, reject) => {
    if (!uiDialogService) {
      reject('UIDialogService is not initiated');
      return;
    }

    callInputDialog({
      uiDialogService,
      title: 'Calibration',
      placeholder: 'Actual Physical distance (mm)',
      defaultValue: `${length}`,
    }).then(newValue => {
      adjustCalibration(Number.parseFloat(newValue));
      resolve(true);
    });
  });
}
