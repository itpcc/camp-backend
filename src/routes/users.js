import { Router } from 'express';
import {
  validateUserStep1,
  validateUserStep2,
  validateUserStep3,
  validateUserStep4,
  validateUserStep5,
  isAuthenticated,
  hasFile,
  requireRoles
} from '../middlewares';
import { authen, adminAuthen } from '../middlewares/authenticator';
import { respondResult, respondErrors } from '../utilities';
import { getUserInfoFromToken } from '../services';
import { User, Question } from '../models';
import { singleUpload } from '../middlewares';
import _ from 'lodash';
import slackUtils from '../utilities/slack';

const router = Router();
router.get('/me', authen(), async (req, res) => {
  const user = await User.findOne({ _id: req.user._id }).populate('questions');
  if (!user) {
    return res.error('User Not Found');
  }
  return res.send(user);
});

router.get('/stat', async (req, res) => {
  try {
    const programmingCompleted = User.count({ status: 'completed', major: 'programming' });
    const designCompleted = User.count({ status: 'completed', major: 'design' });
    const contentCompleted = User.count({ status: 'completed', major: 'content' });
    const marketingCompleted = User.count({ status: 'completed', major: 'marketing' });
    const [programming, design, content, marketing] = await Promise.all([programmingCompleted, designCompleted, contentCompleted, marketingCompleted]);
    return res.send({
      programming,
      design,
      content,
      marketing
    });
  } catch (err) {
    return res.error(err);
  }
});

router.get('/stat/all', adminAuthen('admin'), async (req, res) => {
  try {
    const programmingCompleted = User.count({ status: 'completed', major: 'programming' });
    const designCompleted = User.count({ status: 'completed', major: 'design' });
    const contentCompleted = User.count({ status: 'completed', major: 'content' });
    const marketingCompleted = User.count({ status: 'completed', major: 'marketing' });
    const pendingPromise = User.count({ status: { $ne: 'completed' }, completed: { $ne: [true, true, true, true, true] } });
    const notConfirmPromise = User.count({ status: { $ne: 'completed' }, completed: [true, true, true, true, true] });
    const [programming, design, content, marketing, pending, notConfirm] = await Promise.all([programmingCompleted, designCompleted, contentCompleted, marketingCompleted, pendingPromise, notConfirmPromise]);
    return res.send({
      programming,
      design,
      content,
      marketing,
      pending,
      notConfirm
    });
  } catch (err) {
    return res.error(err);
  }
});

router.get('/stage-one', adminAuthen(['admin', 'stage-1']), async (req, res) => {
  try {
    const users = await User.find({ status: 'completed' });
    return res.send(users);
  } catch (err) {
    return res.error(err);
  }
});

router.get('/stage-two', adminAuthen(['admin', 'stage-2']), async (req, res) => {
  try {
    const users = await User.find({ status: 'completed' });
    return res.send(users);
  } catch (err) {
    return res.error(err);
  }
});

router.get('/programming', adminAuthen(['admin', 'programming']), async (req, res) => {
  try {
    const users = await User.find({ status: 'completed', major: 'programming' });
    return res.send(users);
  } catch (err) {
    return res.error(err);
  }
});

router.get('/design', adminAuthen(['admin', 'design']), async (req, res) => {
  try {
    const users = await User.find({ status: 'completed', major: 'design' });
    return res.send(users);
  } catch (err) {
    return res.error(err);
  }
});

router.get('/marketing', adminAuthen(['admin', 'marketing']), async (req, res) => {
  try {
    const users = await User.find({ status: 'completed', major: 'marketing' });
    return res.send(users);
  } catch (err) {
    return res.error(err);
  }
});

router.get('/content', adminAuthen(['admin', 'content']), async (req, res) => {
  try {
    const users = await User.find({ status: 'completed', major: 'content' });
    return res.send(users);
  } catch (err) {
    return res.error(err);
  }
});

// router.get('/:id',
//   authen(['SuperAdmin', 'Supporter', 'JudgeDev', 'JudgeMarketing', 'JudgeContent', 'JudgeDesign']),
//   async (req, res) => {
//     try {
//       const user = await User.findById(req.params.id).populate('questions');
//       return res.send(user);
//     } catch (e) {
//       return res.error(e);
//     }
//   }
// );

// router.put('/me/step1', authen('in progress'), singleUpload('profilePic', 'jpg', 'png', 'jpeg'), validateUserStep3, /* hasFile, */ async (req, res) => {
//   try {
//     const { _id } = req.user;
//     const availbleFields = [
//       'title',
//       'firstName',
//       'lastName',
//       'nickName',
//       'birthdate',
//       'sex',
//       'phone',
//       'email',
//       'religion',
//       'university',
//       'academicYear',
//       'faculty',
//       'department'
//     ];
//     const user = await User.findOne({ _id });
//     availbleFields.forEach(field => {
//       user[field] = req.body[field];
//     });
//     user.picture = (req.file || {}).path;
//     await Promise.all([user.save(), updateRegisterStep(_id, 1)]);
//     return res.send({ success: true });
//   } catch (e) {
//     return res.error(e);
//   }
// });

// router.put('/me/confirm', authen('in progress'), async (req, res) => {
//   /*
//     TODO
//     1. Check that camper complete ALL general and major question
//     2. Saving role to user
//     3. Marked as completed
//   */
//   try {
//     const { _id } = req.user;
//     await User.findOneAndUpdate({ _id }, { status: 'completed' });
//     return res.send({ success: true });
//   } catch (e) {
//     return respondErrors(res)(e);
//   }
// });

// router.put('/me/step1', isAuthenticated, singleUpload('profilePic', 'jpg', 'png', 'jpeg'), validateUserStep3, hasFile, async (req, res) => {
//   try {
//     // const { facebook } = req.session;
//     const facebook = req.facebook;
//     const availbleFields = [
//       'title',
//       'firstName',
//       'lastName',
//       'nickName',
//       'faculty',
//       'department',
//       'academicYear',
//       'university',
//       'sex',
//       'birthdate'
//     ];
//     const user = await User.findOne({ facebook });
//     _.map(availbleFields, (field) => {
//       user[field] = req.body[field];
//     });
//     user.picture = (req.file || {}).path;
//     await user.save();
//     await updateRegisterStep(facebook, 3);
//     const result = await User.findOne({ facebook }).populate('questions');
//     respondResult(res)(result);
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// });

// router.put('/me/step2', isAuthenticated, validateUserStep4, async (req, res) => {
//   try {
//     // const { facebook } = req.session;
//     const facebook = req.facebook;
//     const availbleFields = [
//       'address',
//       'province',
//       'postCode',
//       'phone',
//       'email',
//       'interview',
//       'idInterview'
//     ];
//     const user = await User.findOne({ facebook });
//     _.map(availbleFields, (field) => {
//       user[field] = req.body[field];
//     });
//     await user.save();
//     await updateRegisterStep(facebook, 4);
//     const result = await User.findOne({ facebook }).populate('questions');
//     respondResult(res)(result);
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// });

// router.put('/me/step3', isAuthenticated, singleUpload('portfolio', 'pdf'), validateUserStep5, async (req, res) => {
//   try {
//     // const { facebook } = req.session;
//     const facebook = req.facebook;
//     const availbleFields = [
//       'blood',
//       'foodAllergy',
//       'disease',
//       'medicine',
//       'knowCamp',
//       'knowCampAnother',
//       'whyJoinYwc',
//       'prominentPoint',
//       'event',
//       'portfolioUrl'
//     ];
//     const user = await User.findOne({ facebook });
//     _.map(availbleFields, (field) => {
//       user[field] = req.body[field];
//     });
//     if (req.file) {
//       user.portfolio = (req.file || {}).path;
//     }
//     await user.save();
//     await updateRegisterStep(facebook, 5);
//     const result = await User.findOne({ facebook }).populate('questions');
//     respondResult(res)(result);
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// });

// router.put('/me/step4', isAuthenticated, validateUserStep1, async (req, res) => {
//   try {
//     // const { facebook } = req.session;
//     const facebook = req.facebook;
//     const { answer1, answer2, answer3 } = req.body;
//     const generalQuestions = [answer1, answer2, answer3].map(answer => ({ answer }));
//     const id = (await User.findOne({ facebook }).select('questions')).questions;
//     const questions = await Question.findById(id);
//     questions.generalQuestions = generalQuestions;
//     await questions.save();
//     await updateRegisterStep(facebook, 1);
//     const result = await User.findOne({ facebook }).populate('questions');
//     respondResult(res)(result);
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// });

// router.put('/me/step5', isAuthenticated, singleUpload('answerFile', 'zip', 'rar', 'x-rar'), validateUserStep2, async (req, res) => {
//   try {
//     // const { facebook } = req.session;
//     const facebook = req.facebook;
//     const { major, answer1, answer2, answer3, answer4, answerFileUrl } = req.body;
//     const specialQuestions = [answer1, answer2, answer3, answer4 || (req.file || {}).path].map(answer => ({ answer }));
//     const id = (await User.findOne({ facebook }).select('questions')).questions;
//     const questions = await Question.findById(id);
//     questions.specialQuestions = specialQuestions.filter(q => !!q.answer);
//     questions.major = major;
//     if ((major === 'programming' || major === 'design')) {
//       questions.answerFileUrl = answerFileUrl;
//       if (req.file) {
//         questions.answerFile = (req.file || {}).path;
//       }
//     }
//     await questions.save();
//     await updateRegisterStep(facebook, 2);
//     const result = await User.findOne({ facebook }).populate('questions');
//     respondResult(res)(result);
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// });

// router.put('/me/step6', isAuthenticated, async (req, res) => {
//   try {
//     // const { facebook } = req.session;
//     const facebook = req.facebook;
//     const user = await User.findOne({ facebook });
//     user.updated_at = new Date();
//     user.save();
//     await updateRegisterStep(facebook, 6);
//     const result = await User.findOne({ facebook }).populate('questions');
//     respondResult(res)(result);
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// });

// router.put('/me/personal', isAuthenticated, async (req, res) => {
//   try {
//     // const { facebook } = req.session;
//     const facebook = req.facebook;
//     const availbleFields = [
//       'phone',
//       'email',
//       'blood',
//       'disease',
//       'foodAllergy',
//       'medicine'
//     ];
//     const user = await User.findOne({ facebook });
//     _.map(availbleFields, (field) => {
//       user[field] = req.body[field];
//     });
//     await user.save();
//     const result = await User.findOne({ facebook }).populate('questions');
//     respondResult(res)(result);
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// });

// router.post('/login', async (req, res) => {
//   try {
//     req.checkBody('accessToken', 'Invalid accessToken').notEmpty().isString();
//     const errors = req.validationErrors();
//     if (errors) respondErrors(errors, 400);
//     else {
//       const { accessToken } = req.body;
//       const { id, email } = await getUserInfoFromToken(accessToken);
//       const user = await User.findOne({ facebook: id });
//       // req.session.accessToken = accessToken;
//       // req.session.facebook = id;
//       if (!user) {
//         const questions = new Question();
//         const q = await questions.save();
//         const newUser = new User({
//           facebook: id,
//           email,
//           questions: q._id,
//           completed: _.range(6).map(() => false),
//           status: 'in progress'
//         });
//         await newUser.save();
//       }
//       const NewUser = await User.findOne({ facebook: id });
//       respondResult(res)(NewUser);
//     }
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// // });

// router.get('/testme/:token', async (req, res) => {
//   try {
//     const facebookInfo = await getUserInfoFromToken(req.params.token);
//     const facebook = facebookInfo.id;
//     const user = await User.findOne({ facebook });
//     respondResult(res)(user);
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// });

// router.get('/logout', (req, res) => {
//   // req.session.destroy(() => {
//   //   req.session = null;
//   //   res.send({ logout: true });
//   // });
//   res.status(200).send({ logout: true });
// });

// router.get('/', requireRoles('SuperAdmin', 'Supporter'), async (req, res) => {
//   try {
//     let status = req.query.status;
//     const userDocs = await User.find(status === 'all' ? {} : { status }).populate('questions');
//     const users = _.map(userDocs, (userDoc) => {
//       const user = userDoc.toObject();
//       user.major = _.get(user, 'questions.major');
//       if (req.session.role !== 'SuperAdmin') delete user.questions;
//       return user;
//     });
//     respondResult(res)(users);
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// });

// router.get('/step', async (req, res) => {
//   try {
//     const users = await User.find({});
//     const counts = users.reduce((prev, cur) => {
//       const count = cur.completed.filter((d) => d === true);
//       prev[count.length]++;
//       return prev;
//     }, [0, 0, 0, 0, 0, 0, 0]);
//     respondResult(res)({ register: counts });
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// });

// router.get('/:id', requireRoles(
//   'SuperAdmin',
//   'Supporter',
//   'JudgeDev',
//   'JudgeMarketing',
//   'JudgeContent',
//   'JudgeDesign'
// ), async (req, res) => {
//   try {
//     const userDoc = await User.findById(req.params.id).populate('questions');
//     const user = userDoc.toObject();
//     respondResult(res)(user);
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// });

// router.put('/:id', requireRoles(
//   'SuperAdmin',
//   'Supporter',
//   'JudgeDev',
//   'JudgeMarketing',
//   'JudgeContent',
//   'JudgeDesign'
// ), async (req, res) => {
//   try {
//     delete req.body.questions;
//     const user = await User.findById(req.params.id);
//     _.map(Object.keys(req.body), key => {
//       user[key] = req.body[key];
//       if (key === 'status' && req.body[key] === 'in progress') {
//         user.completed[1] = false;
//         user.completed[5] = false;
//         user.markModified('completed');
//       }
//       user.markModified(key);
//     });
//     await user.save();
//     const resultDoc = await User.findById(req.params.id);
//     const result = resultDoc.toObject();
//     delete result.questions;
//     respondResult(res)(result);
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// });

// router.get('/profile/:no', async (req, res) => {
//   try {
//     const user = await User.findOne({ no: req.params.no }).populate('questions');
//     respondResult(res)(user);
//   } catch (err) {
//     respondErrors(res)(err);
//   }
// });

export default router;
