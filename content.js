window.BAYGO_CONTENT = {
  "routes": [
    {
      "route_id": "R-ZH-001",
      "city": "Zhuhai",
      "title_en": "Tangjia Old Town: Heritage, Coffee & Tea Cakes",
      "departure_id": "P-ZH-001",
      "return_id": "P-ZH-001",
      "interest_tags": "Food & Drinks",
      "destination_id": "P-ZH-002",
      "conditions": "Suggested itinerary with planning estimates, not live journey times. Check opening hours and the next leg in Amap before setting off.",
      "duration_min": 265,
      "cost_min_cny": null,
      "cost_max_cny": null,
      "transport_modes": "Bus; Walking",
      "cost_note_en": "Per-person planning range includes round-trip buses, listed food/drinks and standard outdoor sightseeing. Reference averages are not fixed prices. Meal and drink allowances are unverified planning assumptions. Shopping and optional paid activities are excluded.",
      "summary_en": "Follow Shanfang Road through Tangjia Old Town, pause at Bugu Cafe, then try traditional tea cakes before returning to BNBU.",
      "source_ids": "SRC-01–05; SRC-17",
      "last_checked": "2026-11-10",
      "status": "Demo ready · Estimated timings",
      "transport_estimate_cny": {
        "min": 4,
        "max": 4
      },
      "budget_items": [
        {
          "label": "Round-trip buses",
          "min": 4,
          "max": 4,
          "note": "Existing route estimate; check the selected services."
        },
        {
          "label": "Bugu Cafe · drink and cake allowance",
          "min": 33,
          "max": 60,
          "note": "Amap reference spend: CNY 33 per person, queried 12 Nov 2026. Upper allowance for adding cake; not a quoted set menu.",
          "source": "https://www.amap.com/place/B0LA1A9NNI"
        },
        {
          "label": "Tangjia tea cakes",
          "min": 10,
          "max": 20,
          "note": "Amap reference spend: CNY 13 per person, queried 12 Nov 2026. Range depends on portions.",
          "source": "https://www.amap.com/place/B0MU4UB5GD"
        },
        {
          "label": "One casual meal",
          "min": 25,
          "max": 45,
          "note": "Planning allowance, not a verified restaurant menu. Choose a meal within this amount."
        },
        {
          "label": "Water / extra drink",
          "min": 5,
          "max": 15,
          "note": "Planning allowance; depends on purchases."
        },
        {
          "label": "Standard sightseeing admission",
          "min": 0,
          "max": 0,
          "note": "Outdoor street/park visit only. Paid exhibitions, rides and optional activities are not included.",
          "source": "https://static.nfnews.com/content/202412/02/c10301967.html"
        }
      ],
      "estimated_total_cny": {
        "min": 77,
        "max": 144
      }
    },
    {
      "route_id": "R-ZH-002",
      "city": "Zhuhai",
      "title_en": "Seaside Park and Zhuhai Fisher Girl",
      "departure_id": "P-ZH-001",
      "return_id": "P-ZH-001",
      "interest_tags": "Nature; Photography",
      "destination_id": "P-ZH-005",
      "conditions": "Daylight and fair weather recommended. Check waterfront access notices.",
      "duration_min": 300,
      "cost_min_cny": 4,
      "cost_max_cny": 4,
      "transport_modes": "Bus; Walking",
      "cost_note_en": "Per-person planning range includes round-trip buses, listed food/drinks and standard outdoor sightseeing. Reference averages are not fixed prices. Meal and drink allowances are unverified planning assumptions. Shopping and optional paid activities are excluded.",
      "summary_en": "Spend time in Seaside Park, then walk to the Fisher Girl statue on the Xianglu Bay waterfront.",
      "source_ids": "SRC-01–05; SRC-08",
      "last_checked": "2026-11-10",
      "status": "Demo ready · Recheck live details",
      "transport_estimate_cny": {
        "min": 4,
        "max": 4
      },
      "budget_items": [
        {
          "label": "Round-trip buses",
          "min": 4,
          "max": 4,
          "note": "Existing route estimate; check the selected services."
        },
        {
          "label": "One casual meal",
          "min": 25,
          "max": 45,
          "note": "Planning allowance, not a verified restaurant menu. Choose a meal within this amount."
        },
        {
          "label": "Water / extra drink",
          "min": 5,
          "max": 15,
          "note": "Planning allowance; depends on purchases."
        },
        {
          "label": "Standard sightseeing admission",
          "min": 0,
          "max": 0,
          "note": "Outdoor street/park visit only. Paid exhibitions, rides and optional activities are not included.",
          "source": "https://you.ctrip.com/sight/zhuhai27/110447.html"
        }
      ],
      "estimated_total_cny": {
        "min": 34,
        "max": 64
      }
    }
  ],
  "stops": [
    {
      "route_id": "R-ZH-002",
      "sequence": 1,
      "place_id": "P-ZH-001",
      "arrival_offset_min": 0,
      "departure_offset_min": 0,
      "stay_min": 0,
      "next_transport": "Walk + Z82 + 69",
      "next_leg_en": "Take Z82 from BNBU East to Tangjiawan Railway Station. Transfer to bus 69 toward New Yuanming Palace and get off at Seaside Park.",
      "move_min": 100,
      "leg_cost_cny": 2,
      "source_ids": "SRC-02, SRC-03, SRC-04, SRC-05"
    },
    {
      "route_id": "R-ZH-002",
      "sequence": 2,
      "place_id": "P-ZH-004",
      "arrival_offset_min": 100,
      "departure_offset_min": 150,
      "stay_min": 50,
      "next_transport": "Walk",
      "next_leg_en": "Walk along Haibin South Road and use a designated crossing to reach the waterfront path on Lovers’ Road.",
      "move_min": 20,
      "leg_cost_cny": 0,
      "source_ids": "SRC-08, SRC-09"
    },
    {
      "route_id": "R-ZH-002",
      "sequence": 3,
      "place_id": "P-ZH-005",
      "arrival_offset_min": 170,
      "departure_offset_min": 200,
      "stay_min": 30,
      "next_transport": "Walk + 69 + Z82",
      "next_leg_en": "Walk back to Seaside Park bus stop. Take bus 69 toward Tangjiawan Railway Station, then Z82 to BNBU East and walk back to campus.",
      "move_min": 100,
      "leg_cost_cny": 2,
      "source_ids": "SRC-02, SRC-03, SRC-04, SRC-05"
    },
    {
      "route_id": "R-ZH-002",
      "sequence": 4,
      "place_id": "P-ZH-001",
      "arrival_offset_min": 300,
      "departure_offset_min": 300,
      "stay_min": 0,
      "next_transport": "End",
      "next_leg_en": "Arrive back at BNBU.",
      "move_min": 0,
      "leg_cost_cny": 0,
      "source_ids": "SRC-01"
    },
    {
      "route_id": "R-ZH-001",
      "sequence": 1,
      "place_id": "P-ZH-001",
      "arrival_offset_min": 0,
      "departure_offset_min": 0,
      "stay_min": 0,
      "move_min": 75,
      "next_transport": "Bus + walking",
      "next_leg_en": "Travel to Tangjia Old Town. Check current departures in Amap.",
      "leg_cost_cny": null
    },
    {
      "route_id": "R-ZH-001",
      "sequence": 2,
      "place_id": "PL-ZH-020",
      "arrival_offset_min": 75,
      "departure_offset_min": 115,
      "stay_min": 40,
      "move_min": 10,
      "next_transport": "Walking",
      "next_leg_en": "Explore Shanfang Road, then continue to Bugu Cafe.",
      "leg_cost_cny": null
    },
    {
      "route_id": "R-ZH-001",
      "sequence": 3,
      "place_id": "P-ZH-002",
      "arrival_offset_min": 125,
      "departure_offset_min": 170,
      "stay_min": 45,
      "move_min": 10,
      "next_transport": "Walking",
      "next_leg_en": "Enjoy coffee and cake, then walk to Tangjia Tea Cakes.",
      "leg_cost_cny": null
    },
    {
      "route_id": "R-ZH-001",
      "sequence": 4,
      "place_id": "PL-ZH-005",
      "arrival_offset_min": 180,
      "departure_offset_min": 200,
      "stay_min": 20,
      "move_min": 65,
      "next_transport": "Bus + walking",
      "next_leg_en": "Try local tea cakes, then check the return journey to BNBU.",
      "leg_cost_cny": null
    },
    {
      "route_id": "R-ZH-001",
      "sequence": 5,
      "place_id": "P-ZH-001",
      "arrival_offset_min": 265,
      "departure_offset_min": 265,
      "stay_min": 0,
      "move_min": 0,
      "next_transport": "End",
      "next_leg_en": "Return to BNBU.",
      "leg_cost_cny": null
    }
  ],
  "places": [
    {
      "place_id": "P-ZH-001",
      "name_en": "BNBU Campus",
      "local_name": "北师香港浸会大学",
      "address": "2000 Jintong Road, Tangjiawan (唐家湾金同路2000号)",
      "description_en": "Campus start and finish. Use the BNBU East stop (浸会大学东) for Z82.",
      "cost": "N/A",
      "hours_or_booking": "Follow campus access rules.",
      "map_search_text": "北师香港浸会大学 金同路2000号",
      "source_ids": "SRC-01; SRC-02"
    },
    {
      "place_id": "P-ZH-002",
      "name_en": "Bugu Cafe",
      "local_name": "Bugu Cafe · 布谷咖啡",
      "address": "Ground floor, Building 1, 277 Shanfang Road, Xiangzhou, Zhuhai (香洲区山房路277号1栋1层)",
      "description_en": "Coffee and cakes in Tangjia Old Town.",
      "cost": "CNY 44/person listed on Dianping; food and drinks separate from bus fare",
      "hours_or_booking": "10:00–20:00 shown in the app screenshot. Recheck before visiting.",
      "map_search_text": "布谷咖啡 山房路277号1栋1层",
      "source_ids": "SRC-17"
    },
    {
      "place_id": "P-ZH-004",
      "name_en": "Zhuhai Seaside Park",
      "local_name": "珠海海滨公园",
      "address": "Haibin South Road, Xiangzhou (香洲区海滨南路)",
      "description_en": "A green space opposite the waterfront near the Fisher Girl statue.",
      "cost": "Not confirmed",
      "hours_or_booking": "Use public paths and check any on-site notices.",
      "map_search_text": "珠海海滨公园",
      "source_ids": "SRC-08"
    },
    {
      "place_id": "P-ZH-005",
      "name_en": "Zhuhai Fisher Girl",
      "local_name": "珠海渔女",
      "address": "Xianglu Bay, Middle Lovers Road, Xiangzhou (香洲区情侣中路香炉湾畔)",
      "description_en": "A landmark sculpture on Xianglu Bay. View it from the public promenade.",
      "cost": "Not confirmed",
      "hours_or_booking": "Check waterfront access after severe weather.",
      "map_search_text": "珠海渔女",
      "source_ids": "SRC-08"
    },
    {
      "place_id": "P-ZH-006",
      "name_en": "Zhuhai High-Tech Zone People’s Hospital",
      "local_name": "珠海高新区人民医院",
      "address": "232 Jinfeng Middle Road, Tangjiawan, Zhuhai High-Tech Zone (珠海高新区唐家湾镇金峰中路232号)",
      "description_en": "Use the Jinfeng Middle Road address when checking your appointment and map.",
      "cost": "Varies by clinic",
      "hours_or_booking": "Check the official booking channel for current clinic schedules.",
      "map_search_text": "珠海高新区人民医院 金峰中路232号",
      "source_ids": "SRC-11; SRC-12"
    }
  ],
  "guides": [
    {
      "guide_id": "G-ZH-001",
      "city": "Zhuhai",
      "category": "Health",
      "title_en": "How to Book an Outpatient Visit at Zhuhai High-Tech Zone People’s Hospital",
      "audience_en": "BNBU students arranging a routine outpatient visit.",
      "bring_en": "Bring your ID. If you plan to use medical insurance, bring your insurance card or credentials and check eligibility. Bring relevant past reports if you have them. Ask the hospital which ID it accepts if you use a passport.",
      "steps_en": "1. Open WeChat and search for 珠海市人民医院. In the official account, look for 高新医院 (High-Tech Hospital) and open its booking service.\n2. Select the clinic and an available time. If you are unsure which clinic to choose, ask the hospital’s outpatient help desk. Confirm the site is 232 Jinfeng Middle Road before booking.\n3. Bring your ID and appointment confirmation. At the outpatient building, follow the check-in instructions in your confirmation, then go to your clinic’s waiting area.\nIf you cannot book online, ask the hospital whether your clinic accepts walk-ins and which documents it requires.",
      "location_id": "P-ZH-006",
      "transport_en": "From Changnanjing Gudao North (长南迳古道北), take B10 toward Xiazha Checkpoint (下栅检查站). Get off at High-Tech Zone People’s Hospital (高新区人民医院) and walk to the hospital. Check live directions from your campus gate.",
      "hours_and_fees_en": "Hours, appointment availability and fees vary by department. Check the hospital’s booking page. The district confirms access through the hospital group’s WeChat account. Menu labels, slots and fees can change.",
      "source_ids": "SRC-11; SRC-12; SRC-13",
      "last_checked": "2026-11-11",
      "status": "Public address verified · Booking details to reconfirm"
    }
  ],
  "activities": [
    {
      "activity_id": "B-DEMO-001",
      "city": "Zhuhai",
      "type": "Outing",
      "title_en": "Weekend Seaside Photo Walk",
      "starts_local": "2026-11-21 13:00",
      "ends_local": "2026-11-21 18:00",
      "meeting_place_id": "P-ZH-001",
      "meeting_detail_en": "Meet on campus before walking to the BNBU East bus stop. Demo schedule in China Standard Time.",
      "capacity": 6,
      "accepted": 2,
      "remaining": 4,
      "cost_split_en": "Estimated CNY 4 per person for buses. Everyone pays their own fare.",
      "organizer": "BayGo Demo Host",
      "campus_verification": "Simulated campus verification",
      "status": "Open",
      "authenticity": "SIMULATED",
      "description_en": "A relaxed walk through Seaside Park and along Xianglu Bay. Bring your phone and try three photo prompts: a park detail, a waterfront view and the Fisher Girl sculpture. The demo group returns to BNBU together.",
      "result_message_en": "Demo application submitted. This does not reserve a real place."
    }
  ],
  "stories": [
    {
      "story_id": "S-DEMO-001",
      "city": "Zhuhai",
      "category": "Travel Tips",
      "title_en": "Tangjia Old Town: Heritage, Coffee & Tea Cakes",
      "author": "BayGo Sample Student",
      "experience_date": "Fictional itinerary",
      "route_id": "R-ZH-001",
      "place_id": "PL-ZH-020",
      "photo_place_ids": [
        "PL-ZH-020",
        "P-ZH-002",
        "PL-ZH-005"
      ],
      "paragraphs": [
        "Start with the street, not the menu. I would take a slow walk along Shanfang Road, notice the old shopfronts and leave room for an unplanned pause.",
        "At Bugu Cafe, I would choose a coffee and check which cakes are available. This is the sit-down part of the afternoon, with time to chat instead of rushing to the next stop.",
        "For the last stop, I would try traditional Tangjia tea cakes. Before heading back, I would check the return journey to BNBU and keep the evening flexible."
      ],
      "body_en": "Start with the street, not the menu. I would take a slow walk along Shanfang Road, notice the old shopfronts and leave room for an unplanned pause.\n\nAt Bugu Cafe, I would choose a coffee and check which cakes are available. This is the sit-down part of the afternoon, with time to chat instead of rushing to the next stop.\n\nFor the last stop, I would try traditional Tangjia tea cakes. Before heading back, I would check the return journey to BNBU and keep the evening flexible.",
      "tags_en": "Walking; Food; Culture",
      "cost_note_en": "Meals, tickets and transport are separate expenses. Check current prices before setting out.",
      "disclosure_en": "Illustrative student story, not a real review or verified visit. Photographs show the named places and do not document this fictional outing.",
      "authenticity": "SIMULATED"
    },
    {
      "story_id": "S-DEMO-GZ",
      "city": "Guangzhou",
      "category": "Travel Tips",
      "title_en": "A Slow Afternoon in Old Guangzhou",
      "author": "BayGo Sample Student",
      "experience_date": "Fictional itinerary",
      "route_id": "",
      "place_id": "PL-GZ-009",
      "photo_place_ids": [
        "PL-GZ-009",
        "PL-GZ-016"
      ],
      "paragraphs": [
        "I would begin in Yongqing Fang, taking time for the lanes and shopfronts rather than trying to cover the whole city.",
        "Shamian would be the second chapter: waterside paths and historic buildings. Nanxin Milk Desserts could be an optional food stop, with the connection checked before setting out."
      ],
      "body_en": "I would begin in Yongqing Fang, taking time for the lanes and shopfronts rather than trying to cover the whole city.\n\nShamian would be the second chapter: waterside paths and historic buildings. Nanxin Milk Desserts could be an optional food stop, with the connection checked before setting out.",
      "tags_en": "Walking; Food; Culture",
      "cost_note_en": "Meals, tickets and transport are separate expenses. Check current prices before setting out.",
      "disclosure_en": "Illustrative student story, not a real review or verified visit. Photographs show the named places and do not document this fictional outing.",
      "authenticity": "SIMULATED"
    },
    {
      "story_id": "S-DEMO-SZ",
      "city": "Shenzhen",
      "category": "Travel Tips",
      "title_en": "From the Park to the Waterfront",
      "author": "BayGo Sample Student",
      "experience_date": "Fictional itinerary",
      "route_id": "",
      "place_id": "PL-SZ-009",
      "photo_place_ids": [
        "PL-SZ-009",
        "PL-SZ-010"
      ],
      "paragraphs": [
        "I would book AA Bus first and choose the Shenzhen drop-off around the park I wanted to visit. A walk in Lianhuashan would make a relaxed start.",
        "The waterfront at Shenzhen Bay Park would be a separate second stop, reached by local transport. I would check both the transfer and the return coach before committing to the full day."
      ],
      "body_en": "I would book AA Bus first and choose the Shenzhen drop-off around the park I wanted to visit. A walk in Lianhuashan would make a relaxed start.\n\nThe waterfront at Shenzhen Bay Park would be a separate second stop, reached by local transport. I would check both the transfer and the return coach before committing to the full day.",
      "tags_en": "Walking; Food; Culture",
      "cost_note_en": "Meals, tickets and transport are separate expenses. Check current prices before setting out.",
      "disclosure_en": "Illustrative student story, not a real review or verified visit. Photographs show the named places and do not document this fictional outing.",
      "authenticity": "SIMULATED"
    },
    {
      "story_id": "S-DEMO-HK",
      "city": "Hong Kong",
      "category": "Travel Tips",
      "title_en": "Art, Harbour Air and a Sweet Finish",
      "author": "BayGo Sample Student",
      "experience_date": "Fictional itinerary",
      "route_id": "",
      "place_id": "PL-HK-008",
      "photo_place_ids": [
        "PL-HK-008",
        "PL-HK-010"
      ],
      "paragraphs": [
        "After the bridge crossing, I would leave enough time for the local connection to M+. I would check exhibition tickets before choosing what to see.",
        "A walk along the Tsim Sha Tsui waterfront would round out the day. If time allowed, I would add a separate trip to Jordan for Kai Kai Dessert, keeping the return crossing in mind."
      ],
      "body_en": "After the bridge crossing, I would leave enough time for the local connection to M+. I would check exhibition tickets before choosing what to see.\n\nA walk along the Tsim Sha Tsui waterfront would round out the day. If time allowed, I would add a separate trip to Jordan for Kai Kai Dessert, keeping the return crossing in mind.",
      "tags_en": "Walking; Food; Culture",
      "cost_note_en": "Meals, tickets and transport are separate expenses. Check current prices before setting out.",
      "disclosure_en": "Illustrative student story, not a real review or verified visit. Photographs show the named places and do not document this fictional outing.",
      "authenticity": "SIMULATED"
    },
    {
      "story_id": "S-DEMO-MO",
      "city": "Macao",
      "category": "Travel Tips",
      "title_en": "Macao Through Squares and Small Streets",
      "author": "BayGo Sample Student",
      "experience_date": "Fictional itinerary",
      "route_id": "",
      "place_id": "PL-MO-008",
      "photo_place_ids": [
        "PL-MO-008",
        "PL-MO-009",
        "PL-MO-010"
      ],
      "paragraphs": [
        "I would start at Senado Square and walk through the old streets towards the Ruins of St. Paul’s, pausing whenever a side street looked interesting.",
        "Taipa would be a separate local-transport leg, not a continuation of the same walk. Around Rua do Cunha, I would look for a meal and leave room for a snack before returning to the border."
      ],
      "body_en": "I would start at Senado Square and walk through the old streets towards the Ruins of St. Paul’s, pausing whenever a side street looked interesting.\n\nTaipa would be a separate local-transport leg, not a continuation of the same walk. Around Rua do Cunha, I would look for a meal and leave room for a snack before returning to the border.",
      "tags_en": "Walking; Food; Culture",
      "cost_note_en": "Meals, tickets and transport are separate expenses. Check current prices before setting out.",
      "disclosure_en": "Illustrative student story, not a real review or verified visit. Photographs show the named places and do not document this fictional outing.",
      "authenticity": "SIMULATED"
    }
  ],
  "previews": [
    {
      "preview_id": "CP-SZ-001",
      "city": "Shenzhen",
      "title_en": "AA Bus to Lianhua Hill Park",
      "interest_tags": "Nature; City views",
      "start_and_end": "BNBU round trip",
      "outbound_en": "Open the AA Bus (AA巴士) WeChat mini program. Search Zhuhai to Shenzhen for your date. Choose an available pickup in Zhuhai and a drop-off convenient for Futian. Travel from BNBU to the pickup on your ticket, take the AA Bus and use local transit to reach the park.",
      "visit_en": "Explore Lianhua Hill Park (莲花山公园), 6030 Hongli Road (红荔路6030号), and walk up to the skyline viewpoint. Lianhua West Station (莲花西站), Exit A1, is one access option.",
      "return_en": "Check the Shenzhen-to-Zhuhai trip in AA Bus before leaving. Use the pickup on that ticket, then return to BNBU from the listed Zhuhai drop-off.",
      "fare_note_en": "Not confirmed. Use the live AA Bus fare for each direction and allow for local transport separately.",
      "time_note_en": "Day trip preview. Total time depends on the selected coach, traffic and transfers.",
      "verification_note_en": "Exact pickup, drop-off, fares and timetable require a dated AA Bus app check. A BNBU pickup has not been confirmed.",
      "source_ids": "SRC-18; SRC-20",
      "last_checked": "2026-11-10",
      "status": "Preview"
    },
    {
      "preview_id": "CP-MO-001",
      "city": "Macao",
      "title_en": "Senado Square and the Ruins of St. Paul’s",
      "interest_tags": "Heritage; Walking",
      "start_and_end": "BNBU round trip",
      "outbound_en": "Travel from BNBU to the HZMB Zhuhai Port (港珠澳大桥珠海公路口岸). Follow signs for the pedestrian crossing to the Macao port and complete border checks. Take Macao bus 101 to Praça Ferreira Amaral (亞馬喇前地), then walk to Senado Square.",
      "visit_en": "Start at Senado Square (議事亭前地) and walk through the historic centre to the Ruins of St. Paul’s (大三巴牌坊).",
      "return_en": "Walk back to Praça Ferreira Amaral, take bus 101 toward the HZMB border building, cross back into Zhuhai, then return to BNBU.",
      "fare_note_en": "Macao bus cash fare published at MOP 6 per ride. Zhuhai access fare depends on the connection.",
      "time_note_en": "Day trip preview. Allow time for border queues and return transport.",
      "verification_note_en": "Check entry requirements for your own travel documents, port access, and last connections before leaving.",
      "source_ids": "SRC-21; SRC-22; SRC-23",
      "last_checked": "2026-11-10",
      "status": "Preview"
    },
    {
      "preview_id": "CP-HK-001",
      "city": "Hong Kong",
      "title_en": "Tsim Sha Tsui Harbour Walk",
      "interest_tags": "Waterfront; Photography",
      "start_and_end": "BNBU round trip",
      "outbound_en": "Travel from BNBU to the HZMB Zhuhai Port. Take the Zhuhai–Hong Kong HZMB Shuttle Bus (金巴). After completing border checks, take B6 to Tung Chung and use the MTR journey planner for Tsim Sha Tsui / East Tsim Sha Tsui. Check current interchange and walking instructions.",
      "visit_en": "Walk from the Clock Tower (尖沙咀鐘樓) along the Tsim Sha Tsui Promenade to the Avenue of Stars (星光大道).",
      "return_en": "Use the MTR back to Tung Chung and B6 towards HZMB Hong Kong Port; confirm the last usable connections. Take the Zhuhai-bound shuttle and arrange the final connection to BNBU.",
      "fare_note_en": "Published adult daytime shuttle references: CNY 58 from Zhuhai and HKD 65 from Hong Kong. B6, MTR and Zhuhai access are additional; check the current fare for each leg.",
      "time_note_en": "Day trip preview. Total time depends on traffic, shuttle connections and border queues.",
      "verification_note_en": "Check your travel documents, the B6 stop and MTR connections. See Life → Intercity Travel & Tickets for official booking and connection sources.",
      "source_ids": "SRC-24; SRC-25; SRC-26; SRC-27",
      "last_checked": "2026-11-15",
      "status": "Preview"
    }
  ],
  "sources": [
    {
      "source_id": "SRC-01",
      "Source": "BNBU | University document",
      "What it supports": "University address",
      "source_url": "https://rcm.bnbu.edu.cn/virtual_attach_file.vsb?afc=mLzVN7LzLZL7rVMTzf2L7CPozrVLRUtZM4LPM8Q7nRlsM4l0gihFp2hmCIa0L1ybLYysMSyPnNn7M8CPL4CbnzN8ozT7L47DoRUPol7bL8rFL7laL4W2nzAFM8U4okbw62j8c&e=.pdf&nid=2438&oid=1696785200&tid=1015",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "University"
    },
    {
      "source_id": "SRC-02",
      "Source": "Zhuhai Transit Wiki | Z82",
      "What it supports": "Stop sequence for BNBU East and Tangjiawan Railway Station",
      "source_url": "https://w.zhbus.org/Z82",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "Third-party data; recheck service"
    },
    {
      "source_id": "SRC-03",
      "Source": "Zhuhai Transit Wiki | Tangjiawan Railway Station",
      "What it supports": "Z82 and bus 69 transfer at the railway station",
      "source_url": "https://w.zhbus.org/%E5%9F%8E%E8%BD%A8%E5%94%90%E5%AE%B6%E6%B9%BE%E7%AB%99",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "Third-party data"
    },
    {
      "source_id": "SRC-04",
      "Source": "Buspedia | Bus 69",
      "What it supports": "Tangjia, Seaside Park and Tangjiawan Railway Station stops",
      "source_url": "https://buspedia.top/line/ia3qxe",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "Third-party data; check live stops"
    },
    {
      "source_id": "SRC-05",
      "Source": "Guanhai Media | Local bus fares",
      "What it supports": "Citywide CNY 1 bus policy used as estimate basis",
      "source_url": "https://pub-zhtb.hizh.cn/s/202503/21/AP67dc649ae4b08edfa75dc442.html",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "News report; transfer discounts excluded"
    },
    {
      "source_id": "SRC-08",
      "Source": "China Southern | Zhuhai travel guide",
      "What it supports": "Location of the statue relative to Seaside Park",
      "source_url": "https://www.csair.com/h5/cn/tourism_strategy/guonei_lvyougonglve/Zhuhai2/1c7i23lfk7d4b.shtml",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "Travel guide"
    },
    {
      "source_id": "SRC-11",
      "Source": "Zhuhai High-Tech Zone | Facility registration",
      "What it supports": "Hospital name and 232 Jinfeng Middle Road address",
      "source_url": "https://www.zhuhai-hitech.gov.cn/attachment/0/365/365206/3629103.pdf",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "Official address record"
    },
    {
      "source_id": "SRC-12",
      "Source": "High-Tech Zone Social Affairs Bureau | WeChat booking channel",
      "What it supports": "The hospital group’s official WeChat account links to High-Tech Hospital booking",
      "source_url": "https://www.zhuhai-hitech.gov.cn/gxxw/tzgg/content/mpost_3718978.html",
      "Checked on": "2026-11-11",
      "Method": "Public web research",
      "Conditions and status": "Official channel reference; current menu and appointment availability may vary"
    },
    {
      "source_id": "SRC-13",
      "Source": "Buspedia | B10",
      "What it supports": "B10 service from Changnanjing Gudao North to the hospital stop",
      "source_url": "https://buspedia.top/line/zmfqw9",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "Third-party transit data"
    },
    {
      "source_id": "SRC-17",
      "Source": "Dianping app | Bugu Cafe",
      "What it supports": "4.4/5; 108 reviews; CNY 44/person; 10:00–20:00; 277 Shanfang Road; coffee and dessert listings",
      "source_url": "User-supplied screenshot (33ade7f1701244dc321b3f1100556606.jpg)",
      "Checked on": "2026-11-10",
      "Method": "User-provided app screenshot",
      "Conditions and status": "Received 2026-11-10. The 22-minute driving estimate is location-dependent and excluded."
    },
    {
      "source_id": "SRC-18",
      "Source": "Yuejiao Technology | AA Bus",
      "What it supports": "Official AA Bus WeChat booking channel",
      "source_url": "https://www.baidubaoche.com/",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "Search the app for travel-date-specific availability"
    },
    {
      "source_id": "SRC-20",
      "Source": "Futian Government | Parks",
      "What it supports": "Lianhua Hill Park address and metro access",
      "source_url": "https://www.szft.gov.cn/en/travel/tourist/parks/content/post_4210150.html",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "Government visitor information"
    },
    {
      "source_id": "SRC-21",
      "Source": "HZMB | User guide",
      "What it supports": "Zhuhai and Macao port pedestrian connection",
      "source_url": "https://www.hzmb.gov.hk/sc/info/users%27%20guide%20for%20HZMB_sc.pdf",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "Check current port operations"
    },
    {
      "source_id": "SRC-22",
      "Source": "Macao DSAT | HZMB city buses",
      "What it supports": "Route 101 and published local bus fares",
      "source_url": "https://www.dsat.gov.mo/hzmb/bus_mac_city.aspx",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "Official transport information"
    },
    {
      "source_id": "SRC-23",
      "Source": "Macao Tourism | Historic centre",
      "What it supports": "Senado Square and Ruins of St. Paul’s",
      "source_url": "https://content.macaotourism.gov.mo/uploads/mgto_brochures/60d14957969ee3fde4fb0888fa19db9203ad9e19.pdf",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "Official walking guide"
    },
    {
      "source_id": "SRC-24",
      "Source": "HZMB Shuttle Bus | Fares",
      "What it supports": "Zhuhai–Hong Kong fares by direction and currency",
      "source_url": "https://www.hzmbus.com/en/message.html?tab=2",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "Daytime adult examples; check live fare"
    },
    {
      "source_id": "SRC-25",
      "Source": "Hong Kong Government | HZMB local public transport",
      "What it supports": "B6 to Tung Chung and B5 to Sunny Bay as port-to-MTR connections",
      "source_url": "https://www.hzmb.gov.hk/sc/local-public.html",
      "Checked on": "2026-11-15",
      "Method": "Public web research",
      "Conditions and status": "Local connections require separate tickets and current service checks"
    },
    {
      "source_id": "SRC-26",
      "Source": "MTR | Network and station maps",
      "What it supports": "MTR connections after reaching Tung Chung",
      "source_url": "https://www.mtr.com.hk/en/customer/services/system_map.html",
      "Checked on": "2026-11-15",
      "Method": "Public web research",
      "Conditions and status": "Use the current journey planner for the actual station pair"
    },
    {
      "source_id": "SRC-27",
      "Source": "Hong Kong Tourism Board | Tsim Sha Tsui",
      "What it supports": "Clock Tower, promenade and Avenue of Stars",
      "source_url": "https://www.discoverhongkong.com/eng/attractions/top-things-to-see-and-do-around-tsim-sha-tsui-promenade.html",
      "Checked on": "2026-11-10",
      "Method": "Public web research",
      "Conditions and status": "Official visitor information"
    }
  ],
  "visitorActions": [
    {
      "content_id": "R-ZH-001",
      "action_label_en": "Check bus 69 stops",
      "action_type": "external_link",
      "value": "https://buspedia.top/line/ia3qxe",
      "purpose_en": "See the route and stop order. Check live arrivals separately."
    },
    {
      "content_id": "P-ZH-002",
      "action_label_en": "Copy café address",
      "action_type": "copy_text",
      "value": "香洲区山房路277号1栋1层 布谷咖啡",
      "purpose_en": "Paste into a map app. Use the street address to check the entrance."
    },
    {
      "content_id": "P-ZH-002",
      "action_label_en": "Copy Dianping search term",
      "action_type": "copy_text",
      "value": "布谷咖啡 山房路277号",
      "purpose_en": "Search in Dianping for current hours and reviews."
    },
    {
      "content_id": "R-ZH-002",
      "action_label_en": "Check bus 69 stops",
      "action_type": "external_link",
      "value": "https://buspedia.top/line/ia3qxe",
      "purpose_en": "See the route and stop order. Check live arrivals separately."
    },
    {
      "content_id": "P-ZH-004",
      "action_label_en": "Copy park name",
      "action_type": "copy_text",
      "value": "珠海海滨公园",
      "purpose_en": "Paste into a map app."
    },
    {
      "content_id": "P-ZH-005",
      "action_label_en": "Copy landmark name",
      "action_type": "copy_text",
      "value": "珠海渔女",
      "purpose_en": "Paste into a map app."
    },
    {
      "content_id": "G-ZH-001",
      "action_label_en": "Copy WeChat account name",
      "action_type": "copy_text",
      "value": "珠海市人民医院",
      "purpose_en": "Search in WeChat and open High-Tech Hospital booking."
    },
    {
      "content_id": "G-ZH-001",
      "action_label_en": "Copy hospital address",
      "action_type": "copy_text",
      "value": "珠海高新区人民医院 金峰中路232号",
      "purpose_en": "Paste into a map app."
    },
    {
      "content_id": "G-ZH-001",
      "action_label_en": "Check B10 bus stops",
      "action_type": "external_link",
      "value": "https://buspedia.top/line/zmfqw9",
      "purpose_en": "Find the boarding stop and High-Tech Zone People’s Hospital stop."
    },
    {
      "content_id": "CP-SZ-001",
      "action_label_en": "Copy AA Bus mini-program name",
      "action_type": "copy_text",
      "value": "AA巴士",
      "purpose_en": "Search in WeChat for dated coach departures, stops and fares."
    },
    {
      "content_id": "CP-SZ-001",
      "action_label_en": "Copy park address",
      "action_type": "copy_text",
      "value": "深圳市福田区红荔路6030号 莲花山公园",
      "purpose_en": "Paste into a map app."
    },
    {
      "content_id": "CP-MO-001",
      "action_label_en": "Check Macao port bus routes and fares",
      "action_type": "external_link",
      "value": "https://www.dsat.gov.mo/hzmb/bus_mac_city.aspx",
      "purpose_en": "Find bus 101, service information and local fare."
    },
    {
      "content_id": "CP-HK-001",
      "action_label_en": "Check bridge shuttle fares and service",
      "action_type": "external_link",
      "value": "https://www.hzmbus.com/en/message.html?tab=2",
      "purpose_en": "Check current shuttle fare and service by direction."
    },
    {
      "content_id": "CP-HK-001",
      "action_label_en": "Check bridge-port bus and MTR connections",
      "action_type": "external_link",
      "value": "https://www.hzmb.gov.hk/sc/local-public.html",
      "purpose_en": "Check B6 towards Tung Chung or B5 towards Sunny Bay, then plan the MTR connection."
    }
  ]
};
