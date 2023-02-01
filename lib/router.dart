import 'package:go_router/go_router.dart';

import 'story/index.dart';

final GoRouter router = GoRouter(
  routes: [
    GoRoute(
      name: 'character',
      path: '/',
      builder: (context, state) => CharacterScreen(),
    ),
    GoRoute(
      name: 'question',
      path: '/question/:questionId',
      builder: (context, state) => QuestionScreen(
          questionIndex: int.parse(state.params['questionId'] ?? '0')),
    ),
    GoRoute(
      name: 'loading',
      path: '/loading',
      builder: (context, state) => LoadingScreen(),
    ),
    GoRoute(
      name: 'story',
      path: '/story',
      builder: (context, state) => StoryScreen(),
    )
  ],
);
