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
        title: titleWidget, actions: actions, body: screenBodyWidget);
    /*
    Widget nestedScrollViewWidget = NestedScrollView(
        floatHeaderSlivers: true,
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
              SliverAppBar(
                floating: true,
                snap: true,
                title: titleWidget,
                actions: actions,
              ),
            ],
        body: screenBodyWidget);*/

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      // Must specify app bar only in the non-scrollable case
      appBar: (showAppBar & !scrollableAppBar) ? appBar : null,
      body: (showAppBar & scrollableAppBar)
          ? SafeArea(child: nestedScrollViewWidget)
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
  _MyNestedScrollViewState createState() => _MyNestedScrollViewState();
}

class _MyNestedScrollViewState extends State<MyNestedScrollView> {
  ScrollController _scrollController = ScrollController();
  bool _pinnedAppBar = false;
  bool _atBottom = false;

  _MyNestedScrollViewState();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_scrollListener);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_scrollListener);
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollListener() {}

  bool _handleInnerScrollNotification(ScrollNotification notification) {
    if (notification.depth == 0) {
      // This checks if the notification comes from the inner scrollable widget
      // Do something with the inner scroll
      if (notification is ScrollEndNotification) {
        // At the end of the inner scroll
        setState(() {
          _pinnedAppBar = true;
          _atBottom = true;
        });
      } else if (notification is UserScrollNotification &&
          notification.direction == ScrollDirection.forward) {
        if (_atBottom) {
          // User is scrolling up
          setState(() {
            _pinnedAppBar = false;
            _atBottom = false;
          });
        }
      } else {
        if (!_atBottom) {
          setState(() {
            _pinnedAppBar = false;
          });
        }
      }
    }
    return false; // Return false to allow the notification to be passed to other listeners
  }

  @override
  Widget build(BuildContext context) {
    return NestedScrollView(
      floatHeaderSlivers: true,
      controller: _scrollController,
      physics: BouncingScrollPhysics(),
      headerSliverBuilder: (context, innerBoxIsScrolled) => [
        SliverAppBar(
          floating: true,
          snap: true,
          pinned: _pinnedAppBar,
          title: widget.title,
          actions: widget.actions,
        ),
      ],
      body: NotificationListener<ScrollNotification>(
        onNotification: (ScrollNotification notification) {
          return _handleInnerScrollNotification(notification);
        },
        child: widget.body,
      ),
    ); // Your NestedScrollView widget implementation
  }
}
