import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

/// Augmented [Scaffold] that comes with a full-width [Container].
///
/// Unless exception, every screen will use this class as a base widget.
class AppScaffold extends StatelessWidget {
  final Widget child;
  final bool showAppBar;
  final String appBarTitle;
  final bool scrollableAppBar;
  final List<Widget>? actions;

  const AppScaffold({
    Key? key,
    required this.child,
    this.showAppBar = true,
    this.appBarTitle = '',
    this.scrollableAppBar = false,
    this.actions,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Widget titleWidget = Text(
      appBarTitle,
      style: Theme.of(context).primaryTextTheme.headlineSmall,
    );

    Widget screenBodyWidget = Container(
      width: MediaQuery.of(context).size.width,
      child: child,
    );

    AppBar appBar = AppBar(
      title: titleWidget,
    );

    Widget nestedScrollViewWidget = MyNestedScrollView(
      title: titleWidget,
      actions: actions,
      body: screenBodyWidget,
    );

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      // Must specify app bar only in the non-scrollable case
      appBar: (showAppBar & !scrollableAppBar) ? appBar : null,
      body: (showAppBar & scrollableAppBar)
          ? SafeArea(child: nestedScrollViewWidget) //nestedScrollViewWidget)
          : SafeArea(child: screenBodyWidget),
    );
  }
}

class MyNestedScrollView extends StatefulWidget {
  final Widget title;
  final List<Widget>? actions;
  final Widget body;

  MyNestedScrollView({
    required this.title,
    required this.actions,
    required this.body,
  });

  @override
  State<MyNestedScrollView> createState() => _MyNestedScrollViewState();
}

class _MyNestedScrollViewState extends State<MyNestedScrollView> {
  bool _pinnedAppBar = false;

  _MyNestedScrollViewState();

  @override
  Widget build(BuildContext context) {
    print(_pinnedAppBar);

    final ScrollController _scrollController = ScrollController();

    void _onScroll() {
      if (_scrollController.position.atEdge) {
        if (_scrollController.position.pixels ==
            _scrollController.position.maxScrollExtent) {
          print('State is true');
          setState(() {
            _pinnedAppBar = true;
          });
        }
      } else {
        setState(() {
          _pinnedAppBar = false;
        });
      }
    }

    _scrollController.addListener(_onScroll);

    return CustomScrollView(controller: _scrollController, slivers: [
      SliverAppBar(
        floating: true,
        snap: true,
        pinned: _pinnedAppBar,
        title: widget.title,
        actions: widget.actions,
      ),
      SliverToBoxAdapter(child: widget.body),
    ]);
  }
}
