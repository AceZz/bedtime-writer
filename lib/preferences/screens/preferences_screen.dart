import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/app_scaffold.dart';

class PreferencesScreen extends ConsumerWidget {
  const PreferencesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AppScaffold(
      appBarTitle: 'Preferences',
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          _PreferenceCategory(
            name: 'Story',
            preferenceOptions: [
              _PreferenceOption(
                text: 'Duration of story:',
                dropdown: _DurationDropdown(),
              ),
            ],
          )
        ],
      ),
    );
  }
}

class _PreferenceCategory extends StatelessWidget {
  final String name;
  final List<_PreferenceOption> preferenceOptions;

  const _PreferenceCategory(
      {Key? key, required this.name, required this.preferenceOptions})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(15),
      child: Column(
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: Text(
              name,
              style: Theme.of(context).primaryTextTheme.headlineSmall,
            ),
          ),
          ...preferenceOptions
        ],
      ),
    );
  }
}

class _PreferenceOption extends StatelessWidget {
  final String text;
  final Widget dropdown;

  const _PreferenceOption(
      {Key? key, required this.text, required this.dropdown})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Theme.of(context).colorScheme.primary,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
        child: Row(children: [
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).primaryTextTheme.bodySmall,
            ),
          ),
          dropdown,
        ]),
      ),
    );
  }
}

class _DurationDropdown extends StatefulWidget {
  @override
  _DurationDropdownState createState() => _DurationDropdownState();
}

class _DurationDropdownState extends State<_DurationDropdown> {
  static const List<int> durations = [2, 5];

  int? _selectedDuration;

  @override
  void initState() {
    super.initState();
    _selectedDuration = durations[0];
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Center(
        child: DropdownButton<int>(
          hint: Text(
            'Select a duration',
            style: Theme.of(context).primaryTextTheme.bodySmall,
          ),
          value: _selectedDuration,
          onChanged: (int? newDuration) {
            setState(() {
              _selectedDuration = newDuration;
            });
          },
          items: durations.map<DropdownMenuItem<int>>((int duration) {
            return DropdownMenuItem<int>(
              value: duration,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: Text(
                  '${duration.toString()} minutes',
                  style: Theme.of(context).primaryTextTheme.bodySmall,
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
