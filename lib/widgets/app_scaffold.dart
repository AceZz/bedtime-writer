import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import 'account_button.dart';
import 'app_background_container.dart';

/// Augmented [Scaffold] that comes with a full-width [Container].
///
/// Unless exception, every screen will use this class as a base widget.
class AppScaffold extends StatelessWidget {
  final Widget child;
  final PreferredSizeWidget? bottom;
  final bool showAppBar;
  final String appBarTitle;
  final bool scrollableAppBar;
  final List<Widget>? actions;
  final bool showAccountButton;

  const AppScaffold({
    Key? key,
    required this.child,
    this.bottom,
    this.showAppBar = true,
    this.appBarTitle = '',
    this.scrollableAppBar = false,
    this.actions,
    this.showAccountButton = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final titleWidget = Text(
      appBarTitle,
      style: Theme.of(context).primaryTextTheme.headlineSmall,
    );

    final screenBodyWidget = SizedBox(
      width: MediaQuery.of(context).size.width,
      child: child,
    );

    final appBar = AppBar(
      title: titleWidget,
      bottom: bottom,
    );

    final scrollView = _ScrollView(
      title: titleWidget,
      actions: actions,
      body: screenBodyWidget,
    );

    final stack = Stack(
      children: [
        const AppBackgroundContainer(),
        scrollableAppBar ? scrollView : screenBodyWidget,
      ],
    );

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      // Must specify app bar only in the non-scrollable case
      appBar: (showAppBar & !scrollableAppBar) ? appBar : null,
      body: stack,
      floatingActionButton:
          showAccountButton ? const FloatingAccountButton() : null,
      floatingActionButtonLocation:
          showAccountButton ? FloatingActionButtonLocation.endTop : null,
    );
  }
}

/// Defines a CustomScrollView so the app bar is automatically displayed at bottom of page
class _ScrollView extends StatefulWidget {
  final Widget title;
  final List<Widget>? actions;
  final Widget body;

  const _ScrollView({
    required this.title,
    required this.actions,
    required this.body,
  });

  @override
  State<_ScrollView> createState() => _ScrollViewState();
}

class _ScrollViewState extends State<_ScrollView> {
  bool _pinnedAppBar = false;

  _ScrollViewState();

  @override
  Widget build(BuildContext context) {
    final ScrollController scrollController = ScrollController();

    void onScroll() {
      if (scrollController.position.atEdge) {
        if (scrollController.position.pixels ==
            scrollController.position.maxScrollExtent) {
          setState(() {
            _pinnedAppBar = true;
          });
        }
      } else if (scrollController.position.userScrollDirection ==
          ScrollDirection.reverse) {
        setState(() {
          _pinnedAppBar = false;
        });
      }
    }

    scrollController.addListener(onScroll);

    return CustomScrollView(
      controller: scrollController,
      slivers: [
        SliverAppBar(
          floating: true,
          snap: true,
          pinned: _pinnedAppBar,
          centerTitle: true,
          title: widget.title,
          actions: widget.actions,
        ),
        SliverToBoxAdapter(child: widget.body),
      ],
    );
  }
}
