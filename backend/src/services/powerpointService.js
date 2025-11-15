const axios = require('axios');
const pptxgen = require('pptxgenjs');

class PowerPointService {
  constructor() {
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
  }

  /**
   * Search and download image from Unsplash
   */
  async getUnsplashImage(keyword) {
    if (!this.unsplashAccessKey) {
      console.warn('⚠️  UNSPLASH_ACCESS_KEY not configured, skipping images');
      return null;
    }

    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query: keyword,
          per_page: 1,
          orientation: 'landscape'
        },
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessKey}`
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const imageUrl = response.data.results[0].urls.regular;
        console.log(`✅ Found Unsplash image for: "${keyword}"`);
        
        // Download image as buffer
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        return {
          data: Buffer.from(imageResponse.data).toString('base64'),
          extension: 'jpg'
        };
      }
    } catch (error) {
      console.error(`❌ Unsplash API error for "${keyword}":`, error.message);
    }
    
    return null;
  }

  /**
   * Generate PowerPoint presentation from slide content
   */
  async generatePowerPoint(slideData) {
    const pptx = new pptxgen();

    // Configure presentation
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'Smart University AI';
    pptx.company = 'Smart University';
    pptx.subject = slideData.title || 'AI Generated Presentation';
    pptx.title = slideData.title || 'Bài giảng';

    const content = slideData.content;
    const style = slideData.style || 'professional';

    // Enhanced color schemes with gradients
    const themes = {
      professional: {
        primary: '1E3A8A',
        secondary: '3B82F6',
        accent: '60A5FA',
        text: '1F2937',
        textLight: 'FFFFFF',
        background: 'F9FAFB',
        gradient1: '1E40AF',
        gradient2: '3B82F6'
      },
      creative: {
        primary: 'EC4899',
        secondary: 'F59E0B',
        accent: '8B5CF6',
        text: '1F2937',
        textLight: 'FFFFFF',
        background: 'FEF3C7',
        gradient1: 'EC4899',
        gradient2: 'F59E0B'
      },
      minimal: {
        primary: '374151',
        secondary: '6B7280',
        accent: '9CA3AF',
        text: '1F2937',
        textLight: 'FFFFFF',
        background: 'F9FAFB',
        gradient1: '4B5563',
        gradient2: '9CA3AF'
      },
      academic: {
        primary: '1E40AF',
        secondary: '3B82F6',
        accent: '60A5FA',
        text: '1F2937',
        textLight: 'FFFFFF',
        background: 'EFF6FF',
        gradient1: '1E3A8A',
        gradient2: '60A5FA'
      }
    };

    const theme = themes[style] || themes.professional;

    // Process each slide with images
    if (content.slides && Array.isArray(content.slides)) {
      for (let i = 0; i < content.slides.length; i++) {
        const slideContent = content.slides[i];
        const slide = pptx.addSlide();

        // Get image if visual_suggestion exists (skip for title slide)
        let imageData = null;
        if (slideContent.visual_suggestion && i > 0) {
          imageData = await this.getUnsplashImage(slideContent.visual_suggestion);
        }

        if (i === 0) {
          // Title slide
          await this.createTitleSlide(slide, slideContent, theme, content);
        } else if (i === content.slides.length - 1) {
          // Conclusion slide
          await this.createConclusionSlide(slide, slideContent, theme, imageData);
        } else {
          // Content slides with different layouts
          await this.createContentSlide(slide, slideContent, theme, i, imageData);
        }
      }
    }

    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    return buffer;
  }

  /**
   * Create enhanced title slide with modern design
   */
  async createTitleSlide(slide, slideContent, theme, presentation) {
    // Gradient background effect
    slide.background = { fill: theme.background };

    // Top decorative bar with gradient
    slide.addShape(pptxgen.shapes.RECTANGLE, {
      x: 0,
      y: 0,
      w: '100%',
      h: 2,
      fill: { color: theme.gradient1, transparency: 30 }
    });

    // Accent line
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0,
      y: 5.5,
      w: '100%',
      h: 0.1,
      fill: { color: theme.accent }
    });

    // Main title with shadow effect
    slide.addText(slideContent.title || presentation.title, {
      x: 0.5,
      y: 1.8,
      w: 9,
      h: 1.5,
      fontSize: 54,
      bold: true,
      color: theme.primary,
      align: 'center',
      fontFace: 'Arial',
      shadow: { type: 'outer', blur: 3, offset: 2, angle: 45, color: '00000033' }
    });

    // Subtitle
    if (slideContent.subtitle || presentation.description) {
      slide.addText(slideContent.subtitle || presentation.description, {
        x: 1,
        y: 3.5,
        w: 8,
        h: 0.8,
        fontSize: 22,
        color: theme.secondary,
        align: 'center',
        italic: true
      });
    }

    // Duration badge
    if (presentation.estimated_duration) {
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 4,
        y: 4.5,
        w: 2,
        h: 0.5,
        fill: { color: theme.accent }
      });

      slide.addText(`⏱️ ${presentation.estimated_duration}`, {
        x: 4,
        y: 4.5,
        w: 2,
        h: 0.5,
        fontSize: 14,
        color: theme.textLight,
        align: 'center',
        bold: true,
        valign: 'middle'
      });
    }

    // Footer
    slide.addText('Được tạo bởi Smart University AI', {
      x: 0.5,
      y: 5.2,
      w: 9,
      h: 0.3,
      fontSize: 11,
      color: theme.secondary,
      align: 'center',
      italic: true
    });
  }

  /**
   * Create content slides with various creative layouts
   */
  async createContentSlide(slide, slideContent, theme, index, imageData) {
    const layout = slideContent.layout || 'title-content';

    switch (layout) {
      case 'title-only':
        this.layoutTitleOnly(slide, slideContent, theme);
        break;
      
      case 'two-column':
        this.layoutTwoColumn(slide, slideContent, theme);
        break;
      
      case 'image-left':
        this.layoutImageLeft(slide, slideContent, theme, imageData);
        break;
      
      case 'image-right':
        this.layoutImageRight(slide, slideContent, theme, imageData);
        break;
      
      case 'image-background':
        this.layoutImageBackground(slide, slideContent, theme, imageData);
        break;
      
      case 'full-image':
        this.layoutFullImage(slide, slideContent, theme, imageData);
        break;
      
      default: // title-content
        this.layoutTitleContent(slide, slideContent, theme);
    }

    // Add slide number
    slide.addText(`${index + 1}`, {
      x: 9.3,
      y: 5.3,
      w: 0.4,
      h: 0.3,
      fontSize: 12,
      color: theme.accent,
      align: 'right',
      bold: true
    });

    // Add speaker notes
    if (slideContent.notes) {
      slide.addNotes(slideContent.notes);
    }
  }

  /**
   * Layout 1: Title Only (for section dividers)
   */
  layoutTitleOnly(slide, slideContent, theme) {
    slide.background = { fill: theme.gradient1 };

    slide.addText(slideContent.title, {
      x: 1,
      y: 2,
      w: 8,
      h: 2,
      fontSize: 48,
      bold: true,
      color: theme.textLight,
      align: 'center',
      valign: 'middle',
      fontFace: 'Arial'
    });

    // Decorative line
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 3,
      y: 4.2,
      w: 4,
      h: 0.05,
      fill: { color: theme.accent }
    });
  }

  /**
   * Layout 2: Title + Content (classic with enhanced design)
   */
  layoutTitleContent(slide, slideContent, theme) {
    slide.background = { fill: theme.background };

    // Title bar with modern styling
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.9,
      fill: { color: theme.primary }
    });

    // Accent stripe
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0,
      y: 0.9,
      w: 10,
      h: 0.05,
      fill: { color: theme.accent }
    });

    slide.addText(slideContent.title, {
      x: 0.5,
      y: 0.2,
      w: 9,
      h: 0.5,
      fontSize: 32,
      bold: true,
      color: theme.textLight,
      valign: 'middle'
    });

    // Content with bullet points
    this.addBulletContent(slide, slideContent.content, {
      x: 0.8,
      y: 1.4,
      w: 8.4,
      h: 3.7,
      theme
    });
  }

  /**
   * Layout 3: Two Columns (for comparisons)
   */
  layoutTwoColumn(slide, slideContent, theme) {
    slide.background = { fill: theme.background };

    // Title
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.8,
      fill: { color: theme.primary }
    });

    slide.addText(slideContent.title, {
      x: 0.5,
      y: 0.15,
      w: 9,
      h: 0.5,
      fontSize: 28,
      bold: true,
      color: theme.textLight,
      valign: 'middle'
    });

    // Split content
    const midPoint = Math.ceil(slideContent.content.length / 2);
    const leftContent = slideContent.content.slice(0, midPoint);
    const rightContent = slideContent.content.slice(midPoint);

    // Left column background
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.4,
      y: 1.1,
      w: 4.5,
      h: 4.1,
      fill: { color: theme.primary, transparency: 95 }
    });

    this.addBulletContent(slide, leftContent, {
      x: 0.6,
      y: 1.3,
      w: 4.1,
      h: 3.7,
      theme,
      fontSize: 16
    });

    // Divider
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 4.97,
      y: 1.2,
      w: 0.06,
      h: 4,
      fill: { color: theme.accent }
    });

    // Right column background
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 5.1,
      y: 1.1,
      w: 4.5,
      h: 4.1,
      fill: { color: theme.secondary, transparency: 95 }
    });

    this.addBulletContent(slide, rightContent, {
      x: 5.3,
      y: 1.3,
      w: 4.1,
      h: 3.7,
      theme,
      fontSize: 16
    });
  }

  /**
   * Layout 4: Image Left + Text Right
   */
  layoutImageLeft(slide, slideContent, theme, imageData) {
    slide.background = { fill: theme.background };

    // Title
    slide.addText(slideContent.title, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: theme.primary
    });

    // Image on left with frame
    if (imageData) {
      slide.addImage({
        data: `data:image/jpeg;base64,${imageData.data}`,
        x: 0.5,
        y: 1.2,
        w: 4.5,
        h: 4,
        sizing: { type: 'cover', w: 4.5, h: 4 }
      });
      
      // Image frame
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0.5,
        y: 1.2,
        w: 4.5,
        h: 4,
        fill: { type: 'solid', color: 'FFFFFF', transparency: 100 },
        line: { color: theme.accent, width: 3 }
      });
    } else {
      // Placeholder
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0.5,
        y: 1.2,
        w: 4.5,
        h: 4,
        fill: { color: theme.secondary, transparency: 80 }
      });
      slide.addText('📷', {
        x: 0.5,
        y: 1.2,
        w: 4.5,
        h: 4,
        fontSize: 72,
        align: 'center',
        valign: 'middle'
      });
    }

    // Content on right
    this.addBulletContent(slide, slideContent.content, {
      x: 5.3,
      y: 1.3,
      w: 4.2,
      h: 3.9,
      theme,
      fontSize: 16
    });
  }

  /**
   * Layout 5: Text Left + Image Right
   */
  layoutImageRight(slide, slideContent, theme, imageData) {
    slide.background = { fill: theme.background };

    // Title
    slide.addText(slideContent.title, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: theme.primary
    });

    // Content on left
    this.addBulletContent(slide, slideContent.content, {
      x: 0.5,
      y: 1.3,
      w: 4.5,
      h: 3.9,
      theme,
      fontSize: 16
    });

    // Image on right with frame
    if (imageData) {
      slide.addImage({
        data: `data:image/jpeg;base64,${imageData.data}`,
        x: 5.2,
        y: 1.2,
        w: 4.3,
        h: 4,
        sizing: { type: 'cover', w: 4.3, h: 4 }
      });
      
      // Image frame
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 5.2,
        y: 1.2,
        w: 4.3,
        h: 4,
        fill: { type: 'solid', color: 'FFFFFF', transparency: 100 },
        line: { color: theme.accent, width: 3 }
      });
    } else {
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 5.2,
        y: 1.2,
        w: 4.3,
        h: 4,
        fill: { color: theme.secondary, transparency: 80 }
      });
      slide.addText('📷', {
        x: 5.2,
        y: 1.2,
        w: 4.3,
        h: 4,
        fontSize: 72,
        align: 'center',
        valign: 'middle'
      });
    }
  }

  /**
   * Layout 6: Image Background + Text Overlay (dramatic)
   */
  layoutImageBackground(slide, slideContent, theme, imageData) {
    // Background image
    if (imageData) {
      slide.addImage({
        data: `data:image/jpeg;base64,${imageData.data}`,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
        sizing: { type: 'cover', w: 10, h: 5.625 }
      });

      // Dark overlay
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
        fill: { color: '000000', transparency: 50 }
      });
    } else {
      slide.background = { fill: theme.gradient1 };
    }

    // Title with semi-transparent background
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 1,
      fill: { color: theme.primary, transparency: 30 }
    });

    slide.addText(slideContent.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 1,
      fontSize: 40,
      bold: true,
      color: theme.textLight,
      align: 'center',
      valign: 'middle'
    });

    // Content box
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1,
      y: 2,
      w: 8,
      h: 3,
      fill: { color: 'FFFFFF', transparency: 20 }
    });

    this.addBulletContent(slide, slideContent.content, {
      x: 1.5,
      y: 2.2,
      w: 7,
      h: 2.6,
      theme: { ...theme, text: 'FFFFFF' },
      fontSize: 18
    });
  }

  /**
   * Layout 7: Full Image (for visual impact)
   */
  layoutFullImage(slide, slideContent, theme, imageData) {
    if (imageData) {
      slide.addImage({
        data: `data:image/jpeg;base64,${imageData.data}`,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
        sizing: { type: 'cover', w: 10, h: 5.625 }
      });

      // Title overlay at bottom
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0,
        y: 4.5,
        w: '100%',
        h: 1.125,
        fill: { color: '000000', transparency: 40 }
      });

      slide.addText(slideContent.title, {
        x: 0.5,
        y: 4.7,
        w: 9,
        h: 0.7,
        fontSize: 36,
        bold: true,
        color: theme.textLight,
        align: 'center',
        valign: 'middle'
      });
    } else {
      this.layoutTitleContent(slide, slideContent, theme);
    }
  }

  /**
   * Helper: Add bullet point content with nested support
   */
  addBulletContent(slide, content, options) {
    const { x, y, w, h, theme, fontSize = 18 } = options;

    if (!content || content.length === 0) return;

    const bullets = [];

    const processContent = (items, level = 0) => {
      items.forEach(item => {
        if (Array.isArray(item)) {
          processContent(item, level + 1);
        } else {
          bullets.push({
            text: String(item),
            options: {
              bullet: level === 0 ? { code: '2022' } : { code: '25E6' },
              indentLevel: level,
              fontSize: fontSize - (level * 2),
              color: theme.text,
              paraSpaceAfter: level === 0 ? 10 : 6
            }
          });
        }
      });
    };

    processContent(content);

    if (bullets.length > 0) {
      slide.addText(bullets, {
        x, y, w, h,
        valign: 'top'
      });
    }
  }

  /**
   * Create modern conclusion slide
   */
  async createConclusionSlide(slide, slideContent, theme, imageData) {
    // Background with subtle gradient
    slide.background = {
      fill: theme.background
    };

    // Top gradient bar
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0,
      y: 0,
      w: 10,
      h: 1.2,
      fill: { color: theme.gradient1 }
    });

    slide.addText(slideContent.title, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 40,
      bold: true,
      color: theme.textLight,
      align: 'center',
      valign: 'middle'
    });

    // Key takeaways box
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1,
      y: 1.6,
      w: 8,
      h: 2.7,
      fill: { color: theme.primary, transparency: 95 },
      line: { color: theme.accent, width: 2 }
    });

    this.addBulletContent(slide, slideContent.content, {
      x: 1.5,
      y: 1.8,
      w: 7,
      h: 2.3,
      theme,
      fontSize: 20
    });

    // Thank you badge
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 2.5,
      y: 4.6,
      w: 5,
      h: 0.7,
      fill: { color: theme.accent }
    });

    slide.addText('🎓 Cảm ơn đã theo dõi!', {
      x: 2.5,
      y: 4.6,
      w: 5,
      h: 0.7,
      fontSize: 28,
      bold: true,
      color: theme.textLight,
      align: 'center',
      valign: 'middle'
    });
  }
}

module.exports = new PowerPointService();
