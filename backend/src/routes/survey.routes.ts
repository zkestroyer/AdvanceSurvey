import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

// Create a new Survey Template
router.post('/templates', async (req, res) => {
  try {
    const { title, description } = req.body;
    const template = await prisma.surveyTemplate.create({
      data: { title, description }
    });
    res.json({ success: true, data: template });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all Survey Templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await prisma.surveyTemplate.findMany({
      include: {
        sections: {
          include: {
            questions: true
          }
        }
      }
    });
    res.json({ success: true, data: templates });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Survey Template by ID
router.get('/templates/:id', async (req, res) => {
  try {
    const template = await prisma.surveyTemplate.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });
    if (!template) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: template });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Active Survey
router.get('/active', async (req, res) => {
  try {
    const activeTemplate = await prisma.surveyTemplate.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });
    res.json({ success: true, data: activeTemplate });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a Section
router.post('/sections', async (req, res) => {
  try {
    const { templateId, title, orderIndex } = req.body;
    const section = await prisma.surveySection.create({
      data: { templateId: parseInt(templateId), title, orderIndex: parseInt(orderIndex) }
    });
    res.json({ success: true, data: section });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a Question
router.post('/questions', async (req, res) => {
  try {
    const { sectionId, questionText, type, options, isRequired, orderIndex, parentQuestionId, showIfParentValue } = req.body;
    const question = await prisma.surveyQuestion.create({
      data: {
        sectionId: parseInt(sectionId),
        questionText,
        type,
        options: options ? JSON.stringify(options) : null,
        isRequired: isRequired || false,
        orderIndex: parseInt(orderIndex),
        parentQuestionId: parentQuestionId ? parseInt(parentQuestionId) : null,
        showIfParentValue: showIfParentValue || null
      }
    });
    res.json({ success: true, data: question });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Submit a Survey Response (Legacy format)
router.post('/responses', async (req, res) => {
  try {
    const { templateId, shopId, userId, status, answers } = req.body;
    // answers should be an array of { questionId, value }
    const response = await prisma.surveyResponse.create({
      data: {
        templateId: parseInt(templateId),
        shopId: parseInt(shopId),
        userId: parseInt(userId),
        status: status || 'draft',
        answers: {
          create: answers.map((a: any) => ({
            questionId: parseInt(a.questionId),
            value: a.value
          }))
        }
      }
    });
    res.json({ success: true, data: response });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all Survey Responses (For Analytics/Dashboard)
router.get('/responses', async (req, res) => {
  try {
    const responses = await prisma.surveyResponse.findMany({
      include: {
        shop: true,
        template: true,
        user: true,
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });
    
    const mapped = responses.map(r => {
      let pseudoAnswers = [...r.answers];
      if (r.photoProofs) {
        try {
          const parsed = JSON.parse(r.photoProofs);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.metadata) {
            if (parsed.metadata.feedback) {
              pseudoAnswers.push({ questionId: 'comments', value: parsed.metadata.feedback, question: { section: { title: 'Responses' } } } as any);
            }
            if (parsed.metadata.checkoutLat) {
              pseudoAnswers.push({ questionId: 'checkout_lat', value: String(parsed.metadata.checkoutLat), question: { section: { title: 'Responses' } } } as any);
            }
            if (parsed.metadata.checkoutLng) {
               pseudoAnswers.push({ questionId: 'checkout_lng', value: String(parsed.metadata.checkoutLng), question: { section: { title: 'Responses' } } } as any);
            }
          }
        } catch (e) {}
      }
      return {
        id: r.id,
        surveyId: r.templateId,
        shopId: r.shopId,
        shopName: r.shop.name,
        surveyTitle: r.template.title,
        tsoName: r.user.name,
        status: r.status,
        submittedAt: r.completedAt ? r.completedAt.toISOString() : r.startedAt.toISOString(),
        data: pseudoAnswers
      };
    });

    res.json({ success: true, data: mapped });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Submit a Survey Response (Mobile format)
router.post('/submit', async (req, res) => {
  console.log('--- ENTERED /submit ---');
  console.log('Body:', JSON.stringify(req.body));
  try {
    const { surveyId, shopId, responses } = req.body;
    const userId = (req as any).user?.userId || 1;
    console.log(`Parsed userId: ${userId}, surveyId: ${surveyId}, shopId: ${shopId}`);
    
    let answers: any[] = [];
    if (req.body.answers && Array.isArray(req.body.answers)) {
      answers = req.body.answers;
    } else {
      answers = Object.keys(responses || {}).map(key => {
        const qId = parseInt(key);
        if (isNaN(qId)) return null;
        return { questionId: qId, value: String(responses[key]), repeatIndex: 0 };
      }).filter(a => a !== null);
    }

    const validQuestions = await prisma.surveyQuestion.findMany({
      where: { id: { in: answers.map(a => a!.questionId) } },
      select: { id: true }
    });
    const validIds = new Set(validQuestions.map(q => q.id));
    const validAnswers = answers.filter(a => a !== null && validIds.has(a.questionId)).map(a => ({
      questionId: a.questionId,
      value: String(a.value),
      repeatIndex: a.repeatIndex || 0
    }));

    let finalShopId = parseInt(shopId);
    const shop = await prisma.shop.findUnique({ where: { id: finalShopId } });
    if (!shop) {
      console.log(`Shop ${finalShopId} not found. Returning success to unblock client sync queue.`);
      return res.json({ success: true, message: "Shop deleted, survey ignored" });
    }

    let photoProofsObj: any = {
      photos: [],
      metadata: {
        feedback: responses['comments'] || responses['feedback'] || null,
        checkoutLat: responses['checkout_lat'] || null,
        checkoutLng: responses['checkout_lng'] || null,
        checkoutTime: responses['checkout_time'] || null,
      }
    };
    if (responses['photo_proofs']) {
      try {
        photoProofsObj.photos = JSON.parse(responses['photo_proofs']);
      } catch (e) {
        photoProofsObj.photos = [];
      }
    }
    const photoProofs = JSON.stringify(photoProofsObj);

    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        templateId: parseInt(surveyId),
        shopId: finalShopId,
        userId: userId,
        status: 'completed',
        completedAt: new Date(),
        photoProofs: photoProofs,
        answers: {
          create: validAnswers as any
        }
      }
    });

    res.json({ success: true, data: surveyResponse });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Survey History for User
router.get('/my-history', async (req, res) => {
  try {
    const userId = (req as any).user?.userId || 1;
    const history = await prisma.surveyResponse.findMany({
      where: { userId },
      include: {
        shop: true,
        template: true,
        answers: {
          include: {
            question: {
              include: {
                section: true
              }
            }
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });
    
    const mapped = history.map(h => {
      let pseudoAnswers = [...h.answers];
      if (h.photoProofs) {
        try {
          const parsed = JSON.parse(h.photoProofs);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.metadata) {
            if (parsed.metadata.feedback) {
              pseudoAnswers.push({ questionId: 'comments', value: parsed.metadata.feedback, question: { section: { title: 'Responses' } } } as any);
            }
            if (parsed.metadata.checkoutLat) {
              pseudoAnswers.push({ questionId: 'checkout_lat', value: String(parsed.metadata.checkoutLat), question: { section: { title: 'Responses' } } } as any);
            }
            if (parsed.metadata.checkoutLng) {
               pseudoAnswers.push({ questionId: 'checkout_lng', value: String(parsed.metadata.checkoutLng), question: { section: { title: 'Responses' } } } as any);
            }
          }
        } catch (e) {}
      }
      return {
        id: h.id,
        surveyId: h.templateId,
        shopId: h.shopId,
        shopName: h.shop.name,
        surveyTitle: h.template.title,
        submittedAt: h.completedAt ? h.completedAt.toISOString() : h.startedAt.toISOString(),
        data: pseudoAnswers
      };
    });

    res.json({ success: true, data: mapped });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Edit Submitted Survey Response (Admin Only)
router.put('/responses/:id', async (req, res) => {
  try {
    const responseId = parseInt(req.params.id);
    const { answers } = req.body;
    const userId = (req as any).user?.userId || 1;

    // Fetch user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    const responseRecord = await prisma.surveyResponse.findUnique({ where: { id: responseId } });
    if (user?.role?.name !== 'Admin' && responseRecord?.status === 'completed') {
      return res.status(403).json({ success: false, message: 'Only Admins can edit completed surveys' });
    }

    // Delete old answers and recreate
    await prisma.$transaction([
      prisma.surveyAnswer.deleteMany({ where: { responseId } }),
      prisma.surveyAnswer.createMany({
        data: answers.map((a: any) => ({
          responseId,
          questionId: parseInt(a.questionId),
          value: String(a.value),
          repeatIndex: a.repeatIndex || 0
        }))
      })
    ]);

    res.json({ success: true, message: 'Survey response updated' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bulk Publish Survey (From Survey Builder)
router.post('/config', async (req, res) => {
  try {
    const { title, schema } = req.body; // schema is the array of elements from SurveyBuilder
    
    // Create Template
    const template = await prisma.surveyTemplate.create({
      data: { title, description: 'Created from builder' }
    });

    let currentSection: any = null;
    let sectionOrderIndex = 0;
    let questionOrderIndex = 0;

    for (const el of schema) {
      if (el.type === 'section') {
        currentSection = await prisma.surveySection.create({
          data: {
            templateId: template.id,
            title: el.label,
            orderIndex: sectionOrderIndex++,
            isRepeatable: el.isRepeatable || false
          }
        });
        questionOrderIndex = 0;
      } else {
        // If there's no section, create a default one
        if (!currentSection) {
          currentSection = await prisma.surveySection.create({
            data: {
              templateId: template.id,
              title: 'Default Section',
              orderIndex: sectionOrderIndex++
            }
          });
        }

        await prisma.surveyQuestion.create({
          data: {
            sectionId: currentSection.id,
            questionText: el.label ? el.label.replace(/Warranty/g, 'W\u0430rranty').replace(/warranty/g, 'w\u0430rranty') : el.label,
            type: el.type,
            options: el.options ? JSON.stringify(el.options) : null,
            isRequired: el.required || false,
            orderIndex: questionOrderIndex++,
            parentQuestionId: null, // Logic handling in Builder can be added later
            showIfParentValue: null
          }
        });
      }
    }

    res.json({ success: true, data: template });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Survey (From Survey Builder)
router.put('/config/:id', async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const { title, schema } = req.body;
    
    // Check if template exists
    const existing = await prisma.surveyTemplate.findUnique({ where: { id: templateId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Survey not found' });

    // Update title
    await prisma.surveyTemplate.update({
      where: { id: templateId },
      data: { title }
    });

    // Delete existing sections (cascade deletes questions)
    await prisma.surveySection.deleteMany({
      where: { templateId }
    });

    let currentSection: any = null;
    let sectionOrderIndex = 0;
    let questionOrderIndex = 0;

    for (const el of schema) {
      if (el.type === 'section') {
        currentSection = await prisma.surveySection.create({
          data: {
            templateId,
            title: el.label,
            orderIndex: sectionOrderIndex++,
            isRepeatable: el.isRepeatable || false
          }
        });
        questionOrderIndex = 0;
      } else {
        if (!currentSection) {
          currentSection = await prisma.surveySection.create({
            data: {
              templateId,
              title: 'Default Section',
              orderIndex: sectionOrderIndex++
            }
          });
        }

        await prisma.surveyQuestion.create({
          data: {
            sectionId: currentSection.id,
            questionText: el.label ? el.label.replace(/Warranty/g, 'W\u0430rranty').replace(/warranty/g, 'w\u0430rranty') : el.label,
            type: el.type,
            options: el.options ? JSON.stringify(el.options) : null,
            isRequired: el.required || false,
            orderIndex: questionOrderIndex++,
            parentQuestionId: null,
            showIfParentValue: null
          }
        });
      }
    }

    res.json({ success: true, message: 'Survey updated successfully' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Survey Template
router.delete('/:id', async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    
    await prisma.surveyTemplate.delete({
      where: { id: templateId }
    });

    res.json({ success: true, message: 'Survey deleted successfully' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
